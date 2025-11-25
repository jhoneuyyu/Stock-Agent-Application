
"""
Custom LangChain Tool for Screener.in Financial Data
This tool allows a financial agent to fetch stock data from Screener.in
"""

from langchain.tools import BaseTool
from typing import Optional, Type
from pydantic import BaseModel, Field
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import json
import re


class ScreenerInputSchema(BaseModel):
    """Input schema for Screener tool"""
    company_name: str = Field(
        description="The company name or stock symbol to search for (e.g., 'Reliance', 'TCS', 'INFY')"
    )


class ScreenerTool(BaseTool):
    """Tool for fetching financial data from Screener.in"""
    
    name: str = "screener_financial_data"
    description: str = """
    Useful for getting detailed financial information about Indian stocks from Screener.in.
    Input should be a company name or stock symbol (e.g., 'Reliance', 'TCS', 'INFY').
    Returns key financial metrics including market cap, P/E ratio, dividend yield, 
    quarterly results, profit & loss, balance sheet data, and more.
    """
    args_schema: Type[BaseModel] = ScreenerInputSchema
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._session = requests.Session()
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        self._session.mount('https://', HTTPAdapter(max_retries=retries))
        self._session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.screener.in/'
        })

    def _search_company(self, company_name: str) -> Optional[str]:
        """Search for company and return the company URL"""
        search_url = "https://www.screener.in/api/company/search/"
        
        try:
            params = {'q': company_name}
            response = self._session.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            
            results = response.json()
            if results and len(results) > 0:
                # Return the URL of the first matching company
                company_url = results[0].get('url')
                return f"https://www.screener.in{company_url}" if company_url else None
            return None
            
        except Exception as e:
            # Return the error as a string so it can be propagated
            print(f"Error searching company: {e}")
            return None
    
    def _scrape_company_data(self, url: str) -> dict:
        """Scrape financial data from company page"""
        try:
            response = self._session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            data = {
                'url': url,
                'company_name': '',
                'current_price': '',
                'market_cap': '',
                'stock_pe': '',
                'book_value': '',
                'dividend_yield': '',
                'roce': '',
                'roe': '',
                'face_value': '',
                'key_metrics': {},
                'peer_comparison': [],
                'quarterly_results': [],
                'profit_loss': [],
                'balance_sheet': [],
                'cash_flows': [],
                'ratios': {},
                'shareholding_pattern': [],
                'compounded_sales_growth': {},
                'compounded_profit_growth': {},
                'stock_price_cagr': {},
                'return_on_equity': {},
            }
            
            # Extract company name
            company_name = soup.find('h1', class_='h2')
            if company_name:
                data['company_name'] = company_name.text.strip()
            
            # Extract key metrics from the top ratios section
            ratios = soup.find_all('li', class_='flex flex-space-between')
            for ratio in ratios:
                name_elem = ratio.find('span', class_='name')
                value_elem = ratio.find('span', class_='number')
                if name_elem and value_elem:
                    key = name_elem.text.strip()
                    value = value_elem.text.strip()
                    data['key_metrics'][key] = value
                    
                    # Also populate main fields
                    if 'Market Cap' in key:
                        data['market_cap'] = value
                    elif 'Current Price' in key:
                        data['current_price'] = value
                    elif 'Stock P/E' in key:
                        data['stock_pe'] = value
                    elif 'Book Value' in key:
                        data['book_value'] = value
                    elif 'Dividend Yield' in key:
                        data['dividend_yield'] = value
                    elif 'ROCE' in key:
                        data['roce'] = value
                    elif 'ROE' in key:
                        data['roe'] = value
                    elif 'Face Value' in key:
                        data['face_value'] = value
            
            # Helper function to extract table data
            def extract_table_data(section_id):
                section = soup.find('section', id=section_id)
                if not section:
                    return []
                
                table = section.find('table')
                if not table:
                    return []
                
                headers = [th.text.strip() for th in table.find('thead').find_all('th')]
                rows = table.find('tbody').find_all('tr')
                
                result = []
                for row in rows:
                    cols = [td.text.strip() for td in row.find_all('td')]
                    if cols:
                        # Handle case where row length matches headers
                        if len(cols) == len(headers):
                             result.append(dict(zip(headers, cols)))
                        # Handle case where first col is row header (common in Screener)
                        elif len(cols) > 0:
                             # Create a dict with the first column as 'Metric' or similar if not in headers
                             row_data = {}
                             # If headers has one less item than cols (often the first empty th), align them
                             if len(headers) == len(cols) - 1:
                                 row_data['Metric'] = cols[0]
                                 for i, h in enumerate(headers):
                                     row_data[h] = cols[i+1]
                             else:
                                 # Fallback: just map what we can
                                 for i, col in enumerate(cols):
                                     if i < len(headers):
                                         row_data[headers[i]] = col
                                     else:
                                         row_data[f"Column_{i}"] = col
                             result.append(row_data)
                return result

            # Extract tables using helper
            data['quarterly_results'] = extract_table_data('quarters')[:4] # Last 4 quarters
            data['profit_loss'] = extract_table_data('profit-loss')[:5]    # Last 5 years
            data['balance_sheet'] = extract_table_data('balance-sheet')[:5] # Last 5 years
            data['cash_flows'] = extract_table_data('cash-flow')[:5]       # Last 5 years
            data['shareholding_pattern'] = extract_table_data('shareholding')
            
            # Extract Ratios - Robust Method
            # Try finding section by ID first, then by text
            ratios_section = soup.find('section', id='ratios')
            if not ratios_section:
                 # Look for any heading with "Ratios"
                 for h in soup.find_all(['h2', 'h3']):
                     if 'Ratios' in h.text:
                         ratios_section = h.find_parent('section')
                         break
            
            if ratios_section:
                table = ratios_section.find('table')
                if table:
                    rows = table.find('tbody').find_all('tr')
                    for row in rows:
                        cols = row.find_all('td')
                        if len(cols) >= 2:
                            ratio_name = cols[0].text.strip()
                            ratio_values = [td.text.strip() for td in cols[1:]]
                            data['ratios'][ratio_name] = ratio_values

            # Extract Peer Comparison
            peers_section = soup.find('section', id='peers')
            if peers_section:
                table = peers_section.find('table')
                if table:
                     # Simple extraction for peers
                     rows = table.find('tbody').find_all('tr')
                     for row in rows:
                         cols = row.find_all('td')
                         if len(cols) > 1:
                             # Usually first col is check, second is name
                             name_col = row.find('a')
                             if name_col:
                                 data['peer_comparison'].append({'Company': name_col.text.strip()})

            # Extract Growth Metrics - Robust Method
            # Based on inspection: <table class="ranges-table"><tr><th colspan="2">Compounded Sales Growth</th></tr>...
            
            ranges_tables = soup.find_all('table', class_='ranges-table')
            
            for table in ranges_tables:
                # Get the header text
                th = table.find('th')
                if not th:
                    continue
                    
                header_text = th.text.strip()
                target_dict = None
                
                if 'Compounded Sales Growth' in header_text:
                    target_dict = data['compounded_sales_growth']
                elif 'Compounded Profit Growth' in header_text:
                    target_dict = data['compounded_profit_growth']
                elif 'Stock Price CAGR' in header_text:
                    target_dict = data['stock_price_cagr']
                elif 'Return on Equity' in header_text:
                    target_dict = data['return_on_equity']
                
                if target_dict is not None:
                    rows = table.find_all('tr')
                    for row in rows:
                        cols = row.find_all('td')
                        if len(cols) == 2:
                            period = cols[0].text.strip().replace(':', '')
                            value = cols[1].text.strip()
                            target_dict[period] = value
            
            return data
            
        except Exception as e:
            return {'error': f"Error scraping data: {str(e)}"}
    
    def _run(self, company_name: str) -> str:
        """Execute the tool to fetch financial data"""
        
        # Step 1: Search for the company
        company_url = self._search_company(company_name)
        
        if not company_url:
            return f"Could not find company '{company_name}' on Screener.in. Please check the company name and try again."
        
        # Step 2: Scrape the company data
        financial_data = self._scrape_company_data(company_url)
        
        if 'error' in financial_data:
            return f"Error fetching data: {financial_data['error']}"
        
        # Step 3: Format the output
        import json
        output = f"""
Financial Data for {financial_data.get('company_name', company_name)}
{'='*60}

CURRENT METRICS:
Current Price: {financial_data.get('current_price', 'N/A')}
Market Cap: {financial_data.get('market_cap', 'N/A')}
Stock P/E: {financial_data.get('stock_pe', 'N/A')}
Book Value: {financial_data.get('book_value', 'N/A')}
Dividend Yield: {financial_data.get('dividend_yield', 'N/A')}
ROCE: {financial_data.get('roce', 'N/A')}
ROE: {financial_data.get('roe', 'N/A')}

KEY METRICS:
{json.dumps(financial_data.get('key_metrics', {}))}

PEER COMPARISON:
{json.dumps(financial_data.get('peer_comparison', []))}

QUARTERLY RESULTS (Last 4 Quarters):
{json.dumps(financial_data.get('quarterly_results', []))}

PROFIT & LOSS (Last 5 Years):
{json.dumps(financial_data.get('profit_loss', []))}

BALANCE SHEET:
{json.dumps(financial_data.get('balance_sheet', []))}

CASH FLOWS:
{json.dumps(financial_data.get('cash_flows', []))}

RATIOS:
{json.dumps(financial_data.get('ratios', {}))}

SHAREHOLDING PATTERN:
{json.dumps(financial_data.get('shareholding_pattern', []))}

COMPOUNDED SALES GROWTH:
{json.dumps(financial_data.get('compounded_sales_growth', {}))}

COMPOUNDED PROFIT GROWTH:
{json.dumps(financial_data.get('compounded_profit_growth', {}))}

STOCK PRICE CAGR:
{json.dumps(financial_data.get('stock_price_cagr', {}))}

RETURN ON EQUITY (Historical):
{json.dumps(financial_data.get('return_on_equity', {}))}

Source: {financial_data.get('url', '')}
"""
        
        return output.strip()
    
    async def _arun(self, company_name: str) -> str:
        """Async version of the tool"""
        # For simplicity, calling the sync version
        # In production, you'd want to use aiohttp for async requests
        return self._run(company_name)