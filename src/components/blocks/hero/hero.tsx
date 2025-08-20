'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { LocaleLink } from '@/i18n/navigation';
import {
  ArrowRight,
  ChevronDown,
  Lock,
  Minus,
  Plus,
  Share2,
  Upload,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const WPLACE_COLORS = [
  // Row 1
  { hex: '#000000', name: 'Black', locked: false },
  { hex: '#3C3C3C', name: 'Dark Gray', locked: false },
  { hex: '#787878', name: 'Gray', locked: false },
  { hex: '#AAAAAA', name: 'Medium Gray', locked: true },
  { hex: '#D2D2D2', name: 'Light Gray', locked: false },
  { hex: '#FFFFFF', name: 'White', locked: false },
  { hex: '#600018', name: 'Deep Red', locked: false },
  { hex: '#A50E1E', name: 'Dark Red', locked: true },

  // Row 2
  { hex: '#ED1C24', name: 'Red', locked: false },
  { hex: '#FA8072', name: 'Light Red', locked: true },
  { hex: '#E45C1A', name: 'Dark Orange', locked: true },
  { hex: '#FF7F27', name: 'Orange', locked: false },
  { hex: '#F6AA09', name: 'Gold', locked: false },
  { hex: '#F9DD3B', name: 'Yellow', locked: false },
  { hex: '#FFFABC', name: 'Light Yellow', locked: false },
  { hex: '#9C8431', name: 'Dark Goldenrod', locked: true },

  // Row 3
  { hex: '#C5AD31', name: 'Goldenrod', locked: true },
  { hex: '#E8D45F', name: 'Light Goldenrod', locked: true },
  { hex: '#4A6B3A', name: 'Dark Olive', locked: true },
  { hex: '#5A944A', name: 'Olive', locked: true },
  { hex: '#84C573', name: 'Light Olive', locked: true },
  { hex: '#0EB968', name: 'Dark Green', locked: false },
  { hex: '#13E67B', name: 'Green', locked: false },
  { hex: '#87FF5E', name: 'Light Green', locked: false },

  // Row 4
  { hex: '#0C816E', name: 'Dark Teal', locked: true },
  { hex: '#10AEA6', name: 'Teal', locked: true },
  { hex: '#13E1BE', name: 'Light Teal', locked: true },
  { hex: '#0F799F', name: 'Dark Cyan', locked: false },
  { hex: '#60F7F2', name: 'Cyan', locked: false },
  { hex: '#BBFAF2', name: 'Light Cyan', locked: false },
  { hex: '#28509E', name: 'Dark Blue', locked: false },
  { hex: '#4093E4', name: 'Blue', locked: false },

  // Row 5
  { hex: '#7DC7FF', name: 'Light Blue', locked: false },
  { hex: '#4D31B8', name: 'Dark Indigo', locked: false },
  { hex: '#6B50F6', name: 'Indigo', locked: false },
  { hex: '#99B1FB', name: 'Light Indigo', locked: false },
  { hex: '#4A4284', name: 'Dark Slate Blue', locked: true },
  { hex: '#7A71C4', name: 'Slate Blue', locked: true },
  { hex: '#B5AEF1', name: 'Light Slate Blue', locked: true },
  { hex: '#780C99', name: 'Dark Purple', locked: false },

  // Row 6
  { hex: '#AA38B9', name: 'Purple', locked: false },
  { hex: '#E09FF9', name: 'Light Purple', locked: false },
  { hex: '#CB007A', name: 'Dark Pink', locked: true },
  { hex: '#EC1F80', name: 'Pink', locked: true },
  { hex: '#F38DA9', name: 'Light Pink', locked: true },
  { hex: '#9B5249', name: 'Dark Peach', locked: false },
  { hex: '#D18078', name: 'Peach', locked: false },
  { hex: '#FAB6A4', name: 'Light Peach', locked: false },

  // Row 7
  { hex: '#684634', name: 'Dark Brown', locked: false },
  { hex: '#95682A', name: 'Brown', locked: false },
  { hex: '#DBA463', name: 'Light Brown', locked: true },
  { hex: '#7B6352', name: 'Dark Tan', locked: true },
  { hex: '#9C846B', name: 'Tan', locked: true },
  { hex: '#D6B594', name: 'Light Tan', locked: true },
  { hex: '#D18051', name: 'Dark Beige', locked: true },
  { hex: '#F8B277', name: 'Beige', locked: false },

  // Row 8
  { hex: '#FFC5A5', name: 'Light Beige', locked: true },
  { hex: '#6D643F', name: 'Dark Stone', locked: true },
  { hex: '#948C6B', name: 'Stone', locked: true },
  { hex: '#CDC59E', name: 'Light Stone', locked: true },
  { hex: '#333941', name: 'Dark Slate', locked: true },
  { hex: '#6D758D', name: 'Slate', locked: true },
  { hex: '#B3B9D1', name: 'Light Slate', locked: true },
  { hex: 'transparent', name: 'Transparent', locked: false },
];

// Define theme color sets
const COLOR_THEMES = {
  classic: {
    name: 'Classic',
    colors: [
      '#000000',
      '#FFFFFF',
      '#ED1C24',
      '#F9DD3B',
      '#28509E',
      '#13E67B',
      '#A50E1E',
      '#FF7F27',
      '#4093E4',
      '#0EB968',
      '#780C99',
      '#CB007A',
    ],
  },
  warm: {
    name: 'Warm',
    colors: [
      '#600018',
      '#A50E1E',
      '#ED1C24',
      '#E45C1A',
      '#FF7F27',
      '#F6AA09',
      '#F9DD3B',
      '#95682A',
      '#D18078',
      '#FAB6A4',
      '#DBA463',
      '#F8B277',
    ],
  },
  cool: {
    name: 'Cool',
    colors: [
      '#28509E',
      '#4093E4',
      '#7DC7FF',
      '#4D31B8',
      '#6B50F6',
      '#99B1FB',
      '#0F799F',
      '#60F7F2',
      '#BBFAF2',
      '#0C816E',
      '#10AEA6',
      '#13E1BE',
    ],
  },
  pastel: {
    name: 'Pastel',
    colors: [
      '#FFFABC',
      '#FAB6A4',
      '#F38DA9',
      '#E09FF9',
      '#99B1FB',
      '#BBFAF2',
      '#B5AEF1',
      '#87FF5E',
      '#FFC5A5',
      '#D6B594',
      '#CDC59E',
      '#B3B9D1',
    ],
  },
  monochrome: {
    name: 'Monochrome',
    colors: [
      '#000000',
      '#3C3C3C',
      '#787878',
      '#AAAAAA',
      '#D2D2D2',
      '#FFFFFF',
      '#333941',
      '#6D758D',
      '#6D643F',
      '#948C6B',
      '#7B6352',
      '#9C846B',
    ],
  },
};

export default function HeroSection() {
  const t = useTranslations('HomePage.hero');
  const linkIntroduction = 'https://wplace.live';
  const linkPrimary = '/start-converting';
  const linkSecondary = 'https://wplace.live';

  // Pixel generator state
  const [pixelSize, setPixelSize] = useState([12]);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageStats, setImageStats] = useState({
    width: 0,
    height: 0,
    total: 0,
  });
  const [showGrid, setShowGrid] = useState(true);
  const [gridColor, setGridColor] = useState('#000000');
  const [zoomLevel, setZoomLevel] = useState([100]);
  const [usedColors, setUsedColors] = useState<
    { color: string; count: number; name: string }[]
  >([]);
  const [selectedColorInfo, setSelectedColorInfo] = useState<{
    color: string;
    count: number;
    name: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [hoveredPixel, setHoveredPixel] = useState<{
    x: number;
    y: number;
    color: string;
    colorName: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultImageRef = useRef<HTMLImageElement>(null);

  // Helper functions
  const findClosestColor = useCallback(
    (r: number, g: number, b: number, allowedColors: string[]) => {
      if (allowedColors.length === 0) {
        // 如果没有允许的颜色，返回黑色作为默认值
        return '#000000';
      }

      let closestColor = allowedColors[0];
      let minDistance = Number.POSITIVE_INFINITY;

      for (const colorHex of allowedColors) {
        // 解析十六进制颜色为RGB值
        const colorR = Number.parseInt(colorHex.slice(1, 3), 16);
        const colorG = Number.parseInt(colorHex.slice(3, 5), 16);
        const colorB = Number.parseInt(colorHex.slice(5, 7), 16);

        // 计算欧氏距离（在RGB颜色空间中）
        const deltaR = r - colorR;
        const deltaG = g - colorG;
        const deltaB = b - colorB;
        const distance = Math.sqrt(
          deltaR * deltaR + deltaG * deltaG + deltaB * deltaB
        );

        // 找到距离最小的颜色
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = colorHex;

          // 如果找到完全匹配的颜色，立即返回
          if (distance === 0) {
            break;
          }
        }
      }

      return closestColor;
    },
    []
  );

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = useCallback(
    (imageSrc: string) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = pixelSize[0];
        const width = Math.floor(img.width / size);
        const height = Math.floor(img.height / size);

        canvas.width = width * size;
        canvas.height = height * size;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);

        // 获取图像数据进行像素级处理
        const imageData = ctx.getImageData(0, 0, width, height);

        // 如果有选中的颜色，使用选中的颜色；否则使用全部颜色
        if (selectedColors.size > 0) {
          const allowedColors = Array.from(selectedColors);

          for (let i = 0; i < imageData.data.length; i += 4) {
            const a = imageData.data[i + 3];

            // 跳过透明像素，保持其透明状态
            if (a === 0) {
              continue;
            }

            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            // 使用欧氏距离找到最相近的颜色
            const closestColor = findClosestColor(r, g, b, allowedColors);
            const newR = Number.parseInt(closestColor.slice(1, 3), 16);
            const newG = Number.parseInt(closestColor.slice(3, 5), 16);
            const newB = Number.parseInt(closestColor.slice(5, 7), 16);

            imageData.data[i] = newR;
            imageData.data[i + 1] = newG;
            imageData.data[i + 2] = newB;
          }

          // 将修改后的图像数据放回画布
          ctx.putImageData(imageData, 0, 0);
        } else {
          // 没有选中任何颜色时，使用所有可用的颜色（排除透明色）
          const allColors = WPLACE_COLORS.filter(
            (c) => c.hex !== 'transparent'
          ).map((c) => c.hex);

          for (let i = 0; i < imageData.data.length; i += 4) {
            const a = imageData.data[i + 3];

            // 跳过透明像素，保持其透明状态
            if (a === 0) {
              continue;
            }

            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            // 使用欧氏距离找到最相近的颜色
            const closestColor = findClosestColor(r, g, b, allColors);
            const newR = Number.parseInt(closestColor.slice(1, 3), 16);
            const newG = Number.parseInt(closestColor.slice(3, 5), 16);
            const newB = Number.parseInt(closestColor.slice(5, 7), 16);

            imageData.data[i] = newR;
            imageData.data[i + 1] = newG;
            imageData.data[i + 2] = newB;
          }

          // 将修改后的图像数据放回画布
          ctx.putImageData(imageData, 0, 0);
        }

        // 分析使用的颜色及其数量（从小尺寸网格图像中统计，每个像素代表一个网格点）
        const gridImageData = ctx.getImageData(0, 0, width, height);
        const colorCounts = new Map<string, number>();
        let totalNonTransparentPixels = 0;
        for (let i = 0; i < gridImageData.data.length; i += 4) {
          const r = gridImageData.data[i];
          const g = gridImageData.data[i + 1];
          const b = gridImageData.data[i + 2];
          const a = gridImageData.data[i + 3];

          // 跳过透明像素（alpha = 0）
          if (a === 0) {
            continue;
          }

          const hex =
            `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
          colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
          totalNonTransparentPixels++;
        }

        setImageStats({ width, height, total: totalNonTransparentPixels });

        // 缩放到最终尺寸
        ctx.drawImage(
          canvas,
          0,
          0,
          width,
          height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // 转换为带有颜色名称的数组
        const colorsWithInfo = Array.from(colorCounts.entries())
          .map(([hex, count]) => {
            const colorInfo = WPLACE_COLORS.find(
              (c) => c.hex.toUpperCase() === hex
            );
            return {
              color: hex,
              count,
              name: colorInfo ? colorInfo.name : hex,
            };
          })
          .sort((a, b) => b.count - a.count); // 按使用量降序排列

        setUsedColors(colorsWithInfo);
        setSelectedColorInfo(null); // 重置选中的颜色信息

        setProcessedImage(canvas.toDataURL());
      };
      img.src = imageSrc;
    },
    [pixelSize, selectedColors, findClosestColor]
  );

  const handleColorToggle = (color: string) => {
    const newSelected = new Set(selectedColors);
    if (newSelected.has(color)) {
      newSelected.delete(color);
    } else {
      newSelected.add(color);
    }
    setSelectedColors(newSelected);
  };

  const selectAllColors = () => {
    setSelectedColors(new Set(WPLACE_COLORS.map((c) => c.hex)));
  };

  const clearAllColors = () => {
    setSelectedColors(new Set());
  };

  const selectFreeColors = () => {
    const freeColors = WPLACE_COLORS.filter((c) => !c.locked).map((c) => c.hex);
    setSelectedColors(new Set(freeColors));
  };

  const applyTheme = (themeKey: keyof typeof COLOR_THEMES) => {
    const theme = COLOR_THEMES[themeKey];
    setSelectedColors(new Set(theme.colors));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      handleImageMouseMove(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredPixel(null);
  };

  const getColorName = useCallback((hex: string) => {
    const color = WPLACE_COLORS.find(
      (c) => c.hex.toUpperCase() === hex.toUpperCase()
    );
    return color ? color.name : hex;
  }, []);

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || !resultImageRef.current) return;

      const rect = resultImageRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      const zoom = zoomLevel[0] / 100;
      const mouseX = (e.clientX - rect.left - imagePosition.x) / zoom;
      const mouseY = (e.clientY - rect.top - imagePosition.y) / zoom;

      // 计算在最终大尺寸图像中的像素位置
      const canvasPixelX = Math.floor(mouseX * scaleX);
      const canvasPixelY = Math.floor(mouseY * scaleY);

      // 计算在小尺寸网格中的位置（用于显示）
      const gridX = Math.floor(canvasPixelX / pixelSize[0]);
      const gridY = Math.floor(canvasPixelY / pixelSize[0]);

      if (
        canvasPixelX >= 0 &&
        canvasPixelX < canvasRef.current.width &&
        canvasPixelY >= 0 &&
        canvasPixelY < canvasRef.current.height &&
        gridX >= 0 &&
        gridX < imageStats.width &&
        gridY >= 0 &&
        gridY < imageStats.height
      ) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // 从最终的大尺寸图像中读取颜色
          const imageData = ctx.getImageData(canvasPixelX, canvasPixelY, 1, 1);
          const [r, g, b] = imageData.data;
          const hex =
            `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
          const colorName = getColorName(hex);

          setHoveredPixel({
            x: gridX,
            y: gridY,
            color: hex,
            colorName,
          });
        }
      } else {
        setHoveredPixel(null);
      }
    },
    [zoomLevel, imagePosition, pixelSize, imageStats, getColorName]
  );

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = processedImage;
    link.click();
  };

  const downloadWithGrid = () => {
    if (!processedImage) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const gridSize = pixelSize[0];

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const link = document.createElement('a');
      link.download = 'pixel-art-with-grid.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = processedImage;
  };

  useEffect(() => {
    if (uploadedImage) {
      processImage(uploadedImage);
    }
  }, [pixelSize, processImage]);

  useEffect(() => {
    if (processedImage) {
      if (!showGrid) {
        // Just show the processed image without grid
        setDisplayImage(processedImage);
      } else {
        // Show the processed image with grid overlay
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Draw grid with selected color
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 1;
          const gridSize = pixelSize[0];

          for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }

          for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          setDisplayImage(canvas.toDataURL());
        };
        img.src = processedImage;
      }
    }
  }, [processedImage, showGrid, gridColor, pixelSize]);

  return (
    <>
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>

        <section>
          <div className="relative pt-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                {/* introduction */}
                <div>
                  <LocaleLink
                    href={linkIntroduction}
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      {t('introduction')}
                    </span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </LocaleLink>
                </div>

                {/* title */}
                <h1 className="mt-8 text-balance text-5xl lg:mt-16 xl:text-[5rem]">
                  {t('title')}
                </h1>

                {/* description */}
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                  {t('description')}
                </p>
              </div>
            </div>

            {/* Pixel Generator */}
            <div>
              <div className="relative mt-8 px-2 sm:mt-12 md:mt-20">
                <div className="mx-auto max-w-7xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel */}
                    <div className="space-y-6">
                      {/* Upload Area */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl font-semibold">
                            {t('pixelGenerator.upload.title')}
                          </CardTitle>
                          <CardDescription>
                            {t('pixelGenerator.upload.description')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t('pixelGenerator.upload.description')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                              {t('pixelGenerator.upload.supportedFormats')}
                            </p>
                            <div className="flex justify-center space-x-4 text-xs text-gray-400">
                              <span>
                                ✓ {t('pixelGenerator.palette.officialPalette')}
                              </span>
                              <span>
                                ✓ {t('pixelGenerator.palette.selectFree')}
                              </span>
                              <span>✓ Instant conversion</span>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pixel Size Control */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">
                            {
                              t('pixelGenerator.pixelSize.label', {
                                size: '',
                              }).split(':')[0]
                            }
                          </CardTitle>
                          <CardDescription>
                            {t('pixelGenerator.pixelSize.description')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">
                                {t('pixelGenerator.pixelSize.label', {
                                  size: pixelSize[0],
                                })}
                              </Label>
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {pixelSize[0] <= 8
                                  ? 'High Detail'
                                  : pixelSize[0] <= 16
                                    ? 'Balanced'
                                    : 'Fast & Simple'}
                              </div>
                            </div>
                            <Slider
                              value={pixelSize}
                              onValueChange={setPixelSize}
                              max={50}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>1px (Ultra HD)</span>
                              <span>25px (Medium)</span>
                              <span>50px (Low Detail)</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Smaller pixels = higher detail but more time to
                              place on Wplace.live (30s per pixel)
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Color Palette */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">
                            {t('pixelGenerator.palette.title')}
                          </CardTitle>
                          <CardDescription>
                            {t('pixelGenerator.palette.officialPalette')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Quick Stats */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                                <div>
                                  <div className="text-blue-600 font-semibold">
                                    {
                                      WPLACE_COLORS.filter((c) => !c.locked)
                                        .length
                                    }
                                  </div>
                                  <div className="text-gray-600">
                                    Free Colors
                                  </div>
                                </div>
                                <div>
                                  <div className="text-purple-600 font-semibold">
                                    {
                                      WPLACE_COLORS.filter((c) => c.locked)
                                        .length
                                    }
                                  </div>
                                  <div className="text-gray-600">
                                    Premium Colors
                                  </div>
                                </div>
                                <div>
                                  <div className="text-green-600 font-semibold">
                                    {WPLACE_COLORS.length - 1}
                                  </div>
                                  <div className="text-gray-600">
                                    Total Colors
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Theme Buttons */}
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-gray-700">
                                Quick Color Themes
                              </div>
                              <div className="grid grid-cols-5 gap-2">
                                {Object.entries(COLOR_THEMES).map(
                                  ([key, theme]) => (
                                    <Button
                                      key={key}
                                      variant="outline"
                                      size="sm"
                                      className="flex flex-col items-center p-2 h-auto hover:scale-105 transition-transform"
                                      onClick={() =>
                                        applyTheme(
                                          key as keyof typeof COLOR_THEMES
                                        )
                                      }
                                    >
                                      <div className="flex space-x-1 mb-1">
                                        {theme.colors
                                          .slice(0, 3)
                                          .map((color, index) => (
                                            <div
                                              key={index}
                                              className="w-3 h-3 rounded-full border border-gray-300"
                                              style={{ backgroundColor: color }}
                                            />
                                          ))}
                                      </div>
                                      <span className="text-xs">
                                        {theme.name}
                                      </span>
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={selectAllColors}
                                >
                                  {t('pixelGenerator.palette.selectAll')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={selectFreeColors}
                                >
                                  {t('pixelGenerator.palette.selectFree')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={clearAllColors}
                                >
                                  {t('pixelGenerator.palette.clear')}
                                </Button>
                              </div>
                              <span className="text-sm text-gray-500">
                                {t('pixelGenerator.palette.selectedCount', {
                                  count: selectedColors.size,
                                  total: WPLACE_COLORS.length,
                                })}
                              </span>
                            </div>

                            <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                              <span>
                                {t('pixelGenerator.palette.clickToSelect')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />= Premium Color
                              </span>
                            </div>

                            <div className="grid grid-cols-16 gap-0.5">
                              {WPLACE_COLORS.map((color, index) => (
                                <div key={index} className="relative">
                                  <button
                                    className={`w-7 h-7 rounded-md border-2 transition-all relative ${
                                      selectedColors.has(color.hex)
                                        ? 'border-blue-500 scale-105'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => handleColorToggle(color.hex)}
                                    title={color.name}
                                  />
                                  {color.locked && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-900 rounded-tl-md rounded-br-md flex items-center justify-center">
                                      <Lock
                                        className="w-2 h-2 text-white"
                                        strokeWidth={3}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-xs text-center text-yellow-800">
                                🎨 Official Wplace.live palette • Premium colors
                                require paid placement • Free colors available
                                24/7
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-xl font-semibold">
                              {t('pixelGenerator.result.title')}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardDescription>
                            {t('pixelGenerator.result.hoverInfo')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {processedImage ? (
                            <div className="space-y-4">
                              {/* Enhanced Stats Panel */}
                              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                                  <div className="text-center">
                                    <span className="text-gray-600 text-xs">
                                      {t('pixelGenerator.result.stats.total')}
                                    </span>
                                    <div className="text-green-600 font-bold text-lg">
                                      {imageStats.total.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-gray-600 text-xs">
                                      ⏱️ Time to Complete
                                    </span>
                                    <div className="text-blue-600 font-bold text-lg">
                                      {(() => {
                                        const totalSeconds =
                                          imageStats.total * 30;
                                        const hours = Math.floor(
                                          totalSeconds / 3600
                                        );
                                        const minutes = Math.floor(
                                          (totalSeconds % 3600) / 60
                                        );
                                        const seconds = totalSeconds % 60;

                                        if (hours > 0) {
                                          return `${hours}h ${minutes}m`;
                                        } else if (minutes > 0) {
                                          return `${minutes}m`;
                                        } else {
                                          return `${seconds}s`;
                                        }
                                      })()}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-gray-600 text-xs">
                                      🎨 Colors Used
                                    </span>
                                    <div className="text-purple-600 font-bold text-lg">
                                      {usedColors.length}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-gray-600 text-xs">
                                      ✅ Free Pixels
                                    </span>
                                    <div className="text-green-600 font-bold text-lg">
                                      {(() => {
                                        let freePixels = 0;
                                        usedColors.forEach((c) => {
                                          const colorInfo = WPLACE_COLORS.find(
                                            (pc) =>
                                              pc.hex.toUpperCase() ===
                                              c.color.toUpperCase()
                                          );
                                          if (colorInfo && !colorInfo.locked) {
                                            freePixels += c.count;
                                          }
                                        });
                                        return freePixels.toLocaleString();
                                      })()}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-gray-600 text-xs">
                                      💎 Premium Pixels
                                    </span>
                                    <div className="text-orange-600 font-bold text-lg">
                                      {(() => {
                                        let premiumPixels = 0;
                                        usedColors.forEach((c) => {
                                          const colorInfo = WPLACE_COLORS.find(
                                            (pc) =>
                                              pc.hex.toUpperCase() ===
                                              c.color.toUpperCase()
                                          );
                                          if (colorInfo && colorInfo.locked) {
                                            premiumPixels += c.count;
                                          }
                                        });
                                        return premiumPixels.toLocaleString();
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 text-center">
                                  <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-1 rounded-full border">
                                    <span>🌍 Ready for Wplace.live</span>
                                    <span>•</span>
                                    <span>30s cooldown per pixel</span>
                                  </div>
                                </div>
                              </div>

                              {/* Colors Used in This Image */}
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                    <span className="text-sm font-medium">
                                      {t(
                                        'pixelGenerator.result.colorsUsed.title'
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span>
                                      {t(
                                        'pixelGenerator.result.colorsUsed.total',
                                        { count: usedColors.length }
                                      )}
                                    </span>
                                    <span>
                                      {t(
                                        'pixelGenerator.result.colorsUsed.free',
                                        {
                                          count: usedColors.filter((c) => {
                                            const colorInfo =
                                              WPLACE_COLORS.find(
                                                (pc) =>
                                                  pc.hex.toUpperCase() ===
                                                  c.color
                                              );
                                            return (
                                              colorInfo && !colorInfo.locked
                                            );
                                          }).length,
                                        }
                                      )}
                                    </span>
                                    <span>
                                      {t(
                                        'pixelGenerator.result.colorsUsed.premium',
                                        {
                                          count: usedColors.filter((c) => {
                                            const colorInfo =
                                              WPLACE_COLORS.find(
                                                (pc) =>
                                                  pc.hex.toUpperCase() ===
                                                  c.color
                                              );
                                            return (
                                              colorInfo && colorInfo.locked
                                            );
                                          }).length,
                                        }
                                      )}
                                    </span>
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2">
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded">
                                      {usedColors.map((colorInfo, index) => {
                                        const wplaceColor = WPLACE_COLORS.find(
                                          (c) =>
                                            c.hex.toUpperCase() ===
                                            colorInfo.color
                                        );
                                        return (
                                          <div key={index} className="relative">
                                            <button
                                              className={`w-6 h-6 rounded border-2 transition-all cursor-pointer hover:scale-110 ${
                                                selectedColorInfo?.color ===
                                                colorInfo.color
                                                  ? 'border-blue-500 scale-110'
                                                  : 'border-gray-300'
                                              }`}
                                              style={{
                                                backgroundColor:
                                                  colorInfo.color,
                                              }}
                                              title={`${colorInfo.name} (${colorInfo.count} pixels)`}
                                              onClick={() =>
                                                setSelectedColorInfo(
                                                  selectedColorInfo?.color ===
                                                    colorInfo.color
                                                    ? null
                                                    : colorInfo
                                                )
                                              }
                                            />
                                            {wplaceColor?.locked && (
                                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-900 rounded-tl-md rounded-br-md flex items-center justify-center">
                                                <Lock
                                                  className="w-2 h-2 text-white"
                                                  strokeWidth={3}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {selectedColorInfo && (
                                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-3">
                                          <div
                                            className="w-8 h-8 rounded border-2 border-blue-500"
                                            style={{
                                              backgroundColor:
                                                selectedColorInfo.color,
                                            }}
                                          />
                                          <div className="flex-1">
                                            <div className="font-medium text-blue-900">
                                              {selectedColorInfo.name}
                                            </div>
                                            <div className="text-sm text-blue-700">
                                              {selectedColorInfo.color}
                                            </div>
                                            <div className="text-sm text-blue-600">
                                              Used in{' '}
                                              {selectedColorInfo.count.toLocaleString()}{' '}
                                              pixels (
                                              {(
                                                (selectedColorInfo.count /
                                                  imageStats.total) *
                                                100
                                              ).toFixed(2)}
                                              %)
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              <div
                                className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative aspect-square"
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                              >
                                <img
                                  ref={resultImageRef}
                                  src={displayImage || '/placeholder.svg'}
                                  alt="Processed pixel art"
                                  className="cursor-move select-none"
                                  style={{
                                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel[0] / 100})`,
                                    transformOrigin: 'top left',
                                    imageRendering: 'pixelated',
                                  }}
                                  onMouseDown={handleMouseDown}
                                  draggable={false}
                                />

                                {hoveredPixel && (
                                  <div
                                    className="absolute bg-black text-white px-2 py-1 rounded text-xs pointer-events-none z-10"
                                    style={{
                                      left: '10px',
                                      top: '10px',
                                    }}
                                  >
                                    <div>
                                      {t(
                                        'pixelGenerator.result.pixelInfo.coordinates',
                                        { x: hoveredPixel.x, y: hoveredPixel.y }
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {t(
                                          'pixelGenerator.result.pixelInfo.color'
                                        )}
                                      </span>
                                      <div
                                        className="w-3 h-3 border border-white rounded"
                                        style={{
                                          backgroundColor: hoveredPixel.color,
                                        }}
                                      />
                                      <span>{hoveredPixel.colorName}</span>
                                    </div>
                                    <div className="text-gray-300">
                                      {hoveredPixel.color}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Image Controls and Operations */}
                              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                {/* Zoom Control */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                                    Zoom:
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setZoomLevel([
                                        Math.max(10, zoomLevel[0] - 10),
                                      ])
                                    }
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Slider
                                    value={zoomLevel}
                                    onValueChange={setZoomLevel}
                                    max={500}
                                    min={10}
                                    step={10}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setZoomLevel([
                                        Math.min(500, zoomLevel[0] + 10),
                                      ])
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <span className="text-sm font-medium w-12">
                                    {zoomLevel[0]}%
                                  </span>
                                </div>

                                {/* Grid Controls */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {t('pixelGenerator.result.controls.grid')}
                                    </span>
                                    <Switch
                                      checked={showGrid}
                                      onCheckedChange={setShowGrid}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {t(
                                        'pixelGenerator.result.controls.color'
                                      )}
                                    </span>
                                    <RadioGroup
                                      value={gridColor}
                                      onValueChange={setGridColor}
                                      className="flex flex-row space-x-1"
                                    >
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="#000000"
                                          id="black"
                                          className="sr-only"
                                        />
                                        <Label
                                          htmlFor="black"
                                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                                            gridColor === '#000000'
                                              ? 'border-blue-500 scale-110'
                                              : 'border-gray-300'
                                          }`}
                                          style={{ backgroundColor: '#000000' }}
                                        />
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="#FFFFFF"
                                          id="white"
                                          className="sr-only"
                                        />
                                        <Label
                                          htmlFor="white"
                                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                                            gridColor === '#FFFFFF'
                                              ? 'border-blue-500 scale-110'
                                              : 'border-gray-300'
                                          }`}
                                          style={{ backgroundColor: '#FFFFFF' }}
                                        />
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="#ED1C24"
                                          id="red"
                                          className="sr-only"
                                        />
                                        <Label
                                          htmlFor="red"
                                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                                            gridColor === '#ED1C24'
                                              ? 'border-blue-500 scale-110'
                                              : 'border-gray-300'
                                          }`}
                                          style={{ backgroundColor: '#ED1C24' }}
                                        />
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="#13E67B"
                                          id="green"
                                          className="sr-only"
                                        />
                                        <Label
                                          htmlFor="green"
                                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                                            gridColor === '#13E67B'
                                              ? 'border-blue-500 scale-110'
                                              : 'border-gray-300'
                                          }`}
                                          style={{ backgroundColor: '#13E67B' }}
                                        />
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </div>

                                {/* Enhanced Download Section */}
                                <div className="space-y-3">
                                  <div className="text-sm font-medium text-gray-700 text-center">
                                    Export for Wplace.live
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={downloadWithGrid}
                                      className="flex flex-col items-center p-4 h-auto"
                                    >
                                      <div className="text-sm font-medium">
                                        With Grid
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Planning template
                                      </div>
                                    </Button>
                                    <Button
                                      onClick={downloadImage}
                                      className="flex flex-col items-center p-4 h-auto bg-blue-600 hover:bg-blue-700"
                                    >
                                      <div className="text-sm font-medium">
                                        Clean Art
                                      </div>
                                      <div className="text-xs text-blue-100">
                                        Final result
                                      </div>
                                    </Button>
                                  </div>
                                  <div className="text-center">
                                    <Button
                                      variant="outline"
                                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                      onClick={() =>
                                        window.open(
                                          'https://wplace.live',
                                          '_blank'
                                        )
                                      }
                                    >
                                      🌍 Open Wplace.live to Start Placing
                                    </Button>
                                  </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <p className="text-xs text-center text-green-800">
                                    💡 Pro tip: Use drag to pan around your
                                    pixel art • Zoom with controls above • Each
                                    pixel takes 30 seconds to place on
                                    Wplace.live
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 min-h-96 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                              <div className="text-6xl mb-4">🎨</div>
                              <p className="text-gray-600 text-lg font-medium mb-2">
                                Your pixel art will appear here
                              </p>
                              <p className="text-gray-400 text-sm text-center max-w-md">
                                Upload an image above to convert it into
                                Wplace-ready pixel art. Perfect for
                                collaborative art on the world's largest pixel
                                canvas!
                              </p>
                              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                <span>✨ Instant conversion</span>
                                <span>•</span>
                                <span>🌍 Wplace.live ready</span>
                                <span>•</span>
                                <span>🎯 Precise pixel mapping</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <canvas
                  ref={canvasRef}
                  style={{
                    display: 'none',
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    visibility: 'hidden',
                    opacity: 0,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
