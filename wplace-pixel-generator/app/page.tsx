"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, Upload, Share2, Minus, Plus, Lock } from "lucide-react"

const WPLACE_COLORS = [
  // Row 1
  { hex: "#000000", name: "Black", locked: false },
  { hex: "#515151", name: "Dark Gray", locked: false },
  { hex: "#808080", name: "Gray", locked: false },
  { hex: "#A8A8A8", name: "Light Gray", locked: false },
  { hex: "#C3C3C3", name: "Lighter Gray", locked: false },
  { hex: "#E8E8E8", name: "Very Light Gray", locked: false },
  { hex: "#FFFFFF", name: "White", locked: false },
  { hex: "#800000", name: "Dark Red", locked: true },
  { hex: "#BE0039", name: "Red", locked: false },
  { hex: "#FF4500", name: "Orange Red", locked: false },
  { hex: "#FFA800", name: "Orange", locked: false },
  { hex: "#FFD635", name: "Yellow", locked: false },
  { hex: "#FFF8B8", name: "Light Yellow", locked: false },
  { hex: "#00A368", name: "Dark Green", locked: false },
  { hex: "#00CC78", name: "Green", locked: false },
  { hex: "#7EED56", name: "Light Green", locked: false },
  { hex: "#00756F", name: "Dark Teal", locked: false },
  { hex: "#009EAA", name: "Teal", locked: false },
  { hex: "#00CCC0", name: "Light Teal", locked: false },
  { hex: "#2450A4", name: "Dark Blue", locked: false },
  { hex: "#3690EA", name: "Blue", locked: false },
  { hex: "#51E9F4", name: "Light Blue", locked: false },
  { hex: "#493AC1", name: "Dark Purple", locked: false },
  { hex: "#6A5CFF", name: "Purple", locked: false },
  { hex: "#94B3FF", name: "Light Purple", locked: false },
  { hex: "#811E9F", name: "Dark Magenta", locked: true },
  { hex: "#B44AC0", name: "Magenta", locked: true },
  { hex: "#E4ABFF", name: "Light Magenta", locked: true },
  { hex: "#DE107F", name: "Pink", locked: true },
  { hex: "#FF3881", name: "Light Pink", locked: true },
  { hex: "#FF99AA", name: "Very Light Pink", locked: true },
  { hex: "#6D482F", name: "Brown", locked: true },
  { hex: "#9C6926", name: "Light Brown", locked: true },
  { hex: "#FFB470", name: "Tan", locked: true },
  { hex: "#000000", name: "Transparent", locked: false },

  // Row 2
  { hex: "#6D001A", name: "Dark Maroon", locked: true },
  { hex: "#BE0039", name: "Crimson", locked: false },
  { hex: "#FF4500", name: "Red Orange", locked: false },
  { hex: "#FFA800", name: "Dark Orange", locked: false },
  { hex: "#FFD635", name: "Gold", locked: false },
  { hex: "#DDDD00", name: "Yellow Green", locked: false },
  { hex: "#00A368", name: "Forest Green", locked: false },
  { hex: "#00CC78", name: "Lime Green", locked: false },
  { hex: "#7EED56", name: "Bright Green", locked: false },
  { hex: "#00756F", name: "Pine Green", locked: false },
  { hex: "#009EAA", name: "Cyan", locked: false },
  { hex: "#00CCC0", name: "Aqua", locked: false },
  { hex: "#2450A4", name: "Navy Blue", locked: false },
  { hex: "#3690EA", name: "Sky Blue", locked: false },
  { hex: "#51E9F4", name: "Light Cyan", locked: false },
  { hex: "#493AC1", name: "Indigo", locked: false },
  { hex: "#6A5CFF", name: "Violet", locked: false },
  { hex: "#94B3FF", name: "Lavender", locked: false },
  { hex: "#811E9F", name: "Purple", locked: true },
  { hex: "#B44AC0", name: "Bright Purple", locked: true },
  { hex: "#E4ABFF", name: "Pale Purple", locked: true },
  { hex: "#DE107F", name: "Hot Pink", locked: true },
  { hex: "#FF3881", name: "Rose", locked: true },
  { hex: "#FF99AA", name: "Baby Pink", locked: true },
  { hex: "#6D482F", name: "Dark Brown", locked: true },
  { hex: "#9C6926", name: "Saddle Brown", locked: true },
  { hex: "#FFB470", name: "Peach", locked: true },
  { hex: "#FFFFFF", name: "Pure White", locked: false },
]

export default function WplacePixelGenerator() {
  const [pixelSize, setPixelSize] = useState([12])
  const [selectedPalette, setSelectedPalette] = useState("official")
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set())
  const [useOnlySelectedColors, setUseOnlySelectedColors] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [imageStats, setImageStats] = useState({ width: 0, height: 0, total: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showColors, setShowColors] = useState(true)
  const [zoomLevel, setZoomLevel] = useState([100])
  const [usedColors, setUsedColors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [displayImage, setDisplayImage] = useState<string | null>(null)
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number; color: string; colorName: string } | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resultImageRef = useRef<HTMLImageElement>(null)

  const findClosestColor = useCallback((r: number, g: number, b: number, allowedColors: string[]) => {
    let closestColor = allowedColors[0]
    let minDistance = Number.POSITIVE_INFINITY

    for (const colorHex of allowedColors) {
      const colorR = Number.parseInt(colorHex.slice(1, 3), 16)
      const colorG = Number.parseInt(colorHex.slice(3, 5), 16)
      const colorB = Number.parseInt(colorHex.slice(5, 7), 16)

      const distance = Math.sqrt(Math.pow(r - colorR, 2) + Math.pow(g - colorG, 2) + Math.pow(b - colorB, 2))

      if (distance < minDistance) {
        minDistance = distance
        closestColor = colorHex
      }
    }

    return closestColor
  }, [])

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      processImage(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const processImage = useCallback(
    (imageSrc: string) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const size = pixelSize[0]
        const width = Math.floor(img.width / size)
        const height = Math.floor(img.height / size)

        canvas.width = width * size
        canvas.height = height * size

        // Draw pixelated version
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, width, height)

        if (selectedColors.size > 0) {
          const imageData = ctx.getImageData(0, 0, width, height)
          const allowedColors = Array.from(selectedColors)

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i]
            const g = imageData.data[i + 1]
            const b = imageData.data[i + 2]

            const closestColor = findClosestColor(r, g, b, allowedColors)
            const newR = Number.parseInt(closestColor.slice(1, 3), 16)
            const newG = Number.parseInt(closestColor.slice(3, 5), 16)
            const newB = Number.parseInt(closestColor.slice(5, 7), 16)

            imageData.data[i] = newR
            imageData.data[i + 1] = newG
            imageData.data[i + 2] = newB
          }

          ctx.putImageData(imageData, 0, 0)
        }

        ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height)

        setImageStats({ width, height, total: width * height })

        // Analyze colors used
        const imageData = ctx.getImageData(0, 0, width, height)
        const colors = new Set<string>()
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          const hex =
            `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
          colors.add(hex)
        }
        setUsedColors(Array.from(colors))

        setProcessedImage(canvas.toDataURL())
      }
      img.src = imageSrc
    },
    [pixelSize, selectedColors, findClosestColor],
  )

  useEffect(() => {
    if (uploadedImage) {
      processImage(uploadedImage)
    }
  }, [pixelSize, processImage])

  useEffect(() => {
    if (processedImage) {
      if (showColors) {
        setDisplayImage(processedImage)
      } else {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Draw grid lines
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = 1
          const gridSize = pixelSize[0]

          // Vertical lines
          for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, canvas.height)
            ctx.stroke()
          }

          // Horizontal lines
          for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(canvas.width, y)
            ctx.stroke()
          }

          setDisplayImage(canvas.toDataURL())
        }
        img.src = processedImage
      }
    }
  }, [processedImage, showColors, pixelSize])

  const downloadImage = () => {
    if (!processedImage) return
    const link = document.createElement("a")
    link.download = "pixel-art.png"
    link.href = processedImage
    link.click()
  }

  const downloadWithGrid = () => {
    if (!processedImage) return
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw grid lines
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 1
      const gridSize = pixelSize[0]

      // Vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      const link = document.createElement("a")
      link.download = "pixel-art-with-grid.png"
      link.href = canvas.toDataURL()
      link.click()
    }
    img.src = processedImage
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else {
      handleImageMouseMove(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setHoveredPixel(null)
  }

  const handleColorToggle = (color: string) => {
    const newSelected = new Set(selectedColors)
    if (newSelected.has(color)) {
      newSelected.delete(color)
    } else {
      newSelected.add(color)
    }
    setSelectedColors(newSelected)
  }

  const selectAllColors = () => {
    setSelectedColors(new Set(WPLACE_COLORS.map((c) => c.hex)))
  }

  const clearAllColors = () => {
    setSelectedColors(new Set())
  }

  const selectFreeColors = () => {
    const freeColors = WPLACE_COLORS.filter((c) => !c.locked).map((c) => c.hex)
    setSelectedColors(new Set(freeColors))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const getColorName = useCallback((hex: string) => {
    const color = WPLACE_COLORS.find((c) => c.hex.toUpperCase() === hex.toUpperCase())
    return color ? color.name : hex
  }, [])

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || !resultImageRef.current) return

      const rect = resultImageRef.current.getBoundingClientRect()
      const scaleX = canvasRef.current.width / rect.width
      const scaleY = canvasRef.current.height / rect.height

      // Calculate mouse position relative to the image, accounting for zoom and pan
      const zoom = zoomLevel[0] / 100
      const mouseX = (e.clientX - rect.left - imagePosition.x) / zoom
      const mouseY = (e.clientY - rect.top - imagePosition.y) / zoom

      // Convert to pixel coordinates
      const pixelX = Math.floor((mouseX * scaleX) / pixelSize[0])
      const pixelY = Math.floor((mouseY * scaleY) / pixelSize[0])

      // Check if coordinates are within bounds
      if (pixelX >= 0 && pixelX < imageStats.width && pixelY >= 0 && pixelY < imageStats.height) {
        // Get pixel color from canvas
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          const imageData = ctx.getImageData(pixelX, pixelY, 1, 1)
          const [r, g, b] = imageData.data
          const hex =
            `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
          const colorName = getColorName(hex)

          setHoveredPixel({
            x: pixelX,
            y: pixelY,
            color: hex,
            colorName,
          })
        }
      } else {
        setHoveredPixel(null)
      }
    },
    [zoomLevel, imagePosition, pixelSize, imageStats, getColorName],
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Upload Area */}
            <Card className="p-8">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag image here</h3>
                <p className="text-sm text-gray-500">Supports PNG, JPG, SVG formats (no size limit)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
              </div>
            </Card>

            {/* Pixel Size Control */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pixel Size: {pixelSize[0]}</Label>
                </div>
                <Slider value={pixelSize} onValueChange={setPixelSize} max={50} min={1} step={1} className="w-full" />
                <p className="text-xs text-gray-500">Auto-converts as you adjust the slider</p>
              </div>
            </Card>

            {/* Advanced Settings */}
            <Card className="p-6">
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">Advanced Settings</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="text-sm text-gray-600">Additional settings would go here</div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Color Palette */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Custom Palette (32 colors)</h3>
                  <RadioGroup
                    value={selectedPalette}
                    onValueChange={setSelectedPalette}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="official" id="official" />
                      <Label htmlFor="official" className="text-sm">
                        Official Palette (64)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="text-sm">
                        Custom Palette (32)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Use only selected colors</span>
                  </div>
                  <Switch checked={useOnlySelectedColors} onCheckedChange={setUseOnlySelectedColors} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={selectFreeColors}>
                      Choose all free colors
                    </Button>
                    <Button variant="outline" size="sm" onClick={selectAllColors}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllColors}>
                      Clear
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Selected: {selectedColors.size}/{WPLACE_COLORS.length} colors
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  Click to select/deselect colors. Locked colors are premium paid colors.
                </div>

                <div className="grid grid-cols-16 gap-1">
                  {WPLACE_COLORS.map((color, index) => (
                    <div key={index} className="relative">
                      <button
                        className={`w-6 h-6 rounded border-2 transition-all relative ${
                          selectedColors.has(color.hex)
                            ? "border-blue-500 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => handleColorToggle(color.hex)}
                        title={color.name}
                      />
                      {color.locked && (
                        <Lock className="w-2 h-2 text-white absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-gray-800 rounded-full p-0.5" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center text-gray-500">
                  Official Wplace 64-color palette - complete match with the game
                </p>
              </div>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Wplace Pixel Paint Result</h3>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Hover over the image to get the corresponding color palette information
              </p>

              {processedImage ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={downloadWithGrid}>
                      Download with Grid
                    </Button>
                    <Button onClick={downloadImage}>Download</Button>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Horizontal:</span>
                        <div className="text-blue-600 font-medium">{imageStats.width}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vertical:</span>
                        <div className="text-blue-600 font-medium">{imageStats.height}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <div className="text-green-600 font-medium">{imageStats.total.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Grid:</span>
                        <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Color:</span>
                        <Switch checked={showColors} onCheckedChange={setShowColors} />
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-black rounded-full"></div>
                          <div className="w-3 h-3 bg-white rounded-full border"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setZoomLevel([Math.max(10, zoomLevel[0] - 10)])}>
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
                    <Button variant="ghost" size="sm" onClick={() => setZoomLevel([Math.min(500, zoomLevel[0] + 10)])}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-12">{zoomLevel[0]}%</span>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Hold and drag the image with mouse or finger to move
                  </p>

                  <div
                    className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative"
                    style={{ height: "400px" }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      ref={resultImageRef}
                      src={displayImage || "/placeholder.svg"}
                      alt="Processed pixel art"
                      className="cursor-move select-none"
                      style={{
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel[0] / 100})`,
                        transformOrigin: "top left",
                        imageRendering: "pixelated",
                      }}
                      onMouseDown={handleMouseDown}
                      draggable={false}
                    />

                    {hoveredPixel && (
                      <div
                        className="absolute bg-black text-white px-2 py-1 rounded text-xs pointer-events-none z-10"
                        style={{
                          left: "10px",
                          top: "10px",
                        }}
                      >
                        <div>
                          坐标: ({hoveredPixel.x}, {hoveredPixel.y})
                        </div>
                        <div className="flex items-center gap-2">
                          <span>颜色:</span>
                          <div
                            className="w-3 h-3 border border-white rounded"
                            style={{ backgroundColor: hoveredPixel.color }}
                          />
                          <span>{hoveredPixel.colorName}</span>
                        </div>
                        <div className="text-gray-300">{hoveredPixel.color}</div>
                      </div>
                    )}
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium">Colors Used in This Image</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>
                          Total: <span className="font-medium">{usedColors.length}</span>
                        </span>
                        <span>
                          Free: <span className="font-medium text-green-600">{usedColors.length}</span>
                        </span>
                        <span>
                          Premium: <span className="font-medium">0</span>
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded">
                        {usedColors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 min-h-96 flex items-center justify-center">
                  <p className="text-gray-400">Please upload an image to start</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
