# Ballpit Component

An interactive 3D physics-based ball pit component built with Three.js and React.

## Features

- 🎨 **Beautiful 3D Graphics** - Hardware-accelerated WebGL rendering
- ⚛️ **Physics Simulation** - Realistic ball collisions and gravity
- 🖱️ **Interactive** - Balls follow your cursor movement
- 🎨 **Customizable** - Configure colors, physics, and appearance
- 📱 **Touch Support** - Works on mobile devices
- ⚡ **Performance Optimized** - Intersection observer for efficient rendering

## Installation

The component requires the following dependencies (already included in your project):

```bash
npm install three gsap
```

For TypeScript support:

```bash
npm install @types/three
```

## Usage

### Basic Example

```tsx
import Ballpit from '@/components/Ballpit';

export default function MyPage() {
  return (
    <div style={{position: 'relative', overflow: 'hidden', minHeight: '500px', width: '100%'}}>
      <Ballpit
        count={200}
        gravity={0.7}
        friction={0.8}
        wallBounce={0.95}
        followCursor={true}
      />
    </div>
  );
}
```

### Next.js Usage (Recommended)

To avoid SSR issues with Three.js, use dynamic imports:

```tsx
'use client';

import dynamic from 'next/dynamic';

const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

export default function MyPage() {
  return (
    <div style={{position: 'relative', overflow: 'hidden', minHeight: '500px', width: '100%'}}>
      <Ballpit
        count={200}
        gravity={0.7}
        friction={0.8}
        wallBounce={0.95}
        followCursor={true}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `''` | Additional CSS classes |
| `followCursor` | boolean | `true` | Whether balls should follow cursor |
| `count` | number | `200` | Number of balls |
| `gravity` | number | `0.5` | Gravity strength (0 = no gravity) |
| `friction` | number | `0.9975` | Friction coefficient (0-1) |
| `wallBounce` | number | `0.95` | Wall bounce coefficient (0-1) |
| `minSize` | number | `0.5` | Minimum ball size |
| `maxSize` | number | `1` | Maximum ball size |
| `colors` | number[] | `[0, 0, 0]` | Array of hex colors (e.g., `[0x3b82f6, 0x8b5cf6]`) |
| `ambientColor` | number | `0xffffff` | Ambient light color |
| `ambientIntensity` | number | `1` | Ambient light intensity |
| `lightIntensity` | number | `200` | Point light intensity |

## Examples

### Colorful Ballpit

```tsx
<Ballpit
  count={150}
  gravity={0.5}
  friction={0.85}
  wallBounce={0.9}
  followCursor={true}
  colors={[0x3b82f6, 0x8b5cf6, 0xec4899, 0xf59e0b]}
  minSize={0.3}
  maxSize={0.8}
/>
```

### Zero Gravity

```tsx
<Ballpit
  count={100}
  gravity={0}
  friction={0.99}
  wallBounce={0.95}
  followCursor={true}
  colors={[0x06b6d4, 0x14b8a6, 0x10b981]}
/>
```

### High Energy

```tsx
<Ballpit
  count={300}
  gravity={0.9}
  friction={0.95}
  wallBounce={0.98}
  followCursor={true}
  colors={[0xef4444, 0xf97316, 0xfbbf24]}
  minSize={0.2}
  maxSize={0.6}
/>
```

## Demo

Visit `/ballpit-demo` to see various configurations in action.

## Color Reference

Use hex color values for the `colors` prop. Here are some examples:

- **Blue**: `0x3b82f6`
- **Purple**: `0x8b5cf6`
- **Pink**: `0xec4899`
- **Orange**: `0xf97316`
- **Yellow**: `0xfbbf24`
- **Green**: `0x10b981`
- **Cyan**: `0x06b6d4`
- **Red**: `0xef4444`

## Performance Tips

1. **Adjust ball count** - Lower count for better performance on mobile
2. **Limit colors** - Using 2-4 colors provides good visual variety
3. **Container size** - Larger containers may need performance tuning
4. **Friction & bounce** - Higher values create more stable simulations

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers with WebGL support

## License

MIT
