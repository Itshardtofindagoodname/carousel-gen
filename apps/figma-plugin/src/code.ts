/* global figma, __html__, FrameNode */
/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="@figma/plugin-typings" />

// Figma Plugin Backend Code

figma.showUI(__html__, { width: 450, height: 500 });

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.trim().replace('#', '');
  const r = parseInt(clean.slice(0, 2) || 'ff', 16) / 255;
  const g = parseInt(clean.slice(2, 4) || 'ff', 16) / 255;
  const b = parseInt(clean.slice(4, 6) || 'ff', 16) / 255;
  return { r, g, b };
}

figma.ui.onmessage = async (msg: { type: string; slides: any[] }) => {
  if (msg.type === 'create-carousel') {
    const { slides } = msg;

    const nodes: FrameNode[] = [];
    let xOffset = 0;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const frame = figma.createFrame();
      frame.name = `Slide ${String(i + 1).padStart(2, '0')}`;
      frame.resize(slide.width, slide.height);
      frame.x = xOffset;
      frame.y = 0;
      frame.backgrounds = [{ type: 'SOLID', color: hexToRgb(slide.backgroundColor) }];

      xOffset += slide.width + 100; // Lay out slides horizontally with 100px gap

      for (const node of slide.nodes) {
        if (node.type === 'rect') {
          const rect = figma.createRectangle();
          rect.name = 'Shape';
          rect.resize(node.width, node.height);
          rect.x = node.x;
          rect.y = node.y;

          if (node.fill) {
            // Check if gradient or color (defaulting to solid color)
            rect.fills = [{ type: 'SOLID', color: hexToRgb(node.fill) }];
          }

          if (node.stroke) {
            rect.strokes = [{ type: 'SOLID', color: hexToRgb(node.stroke) }];
            rect.strokeWeight = node.strokeWidth || 1;
          }

          if (node.borderRadius) {
            rect.cornerRadius = node.borderRadius;
          }

          frame.appendChild(rect);
        } else if (node.type === 'text') {
          const text = figma.createText();
          text.name = 'Text Content';

          // Resolve font family style (Regular or Bold)
          const isBold =
            node.fontWeight === 'bold' || node.fontWeight === 700 || node.fontWeight === '700';
          const fontStyle = isBold ? 'Bold' : 'Regular';

          // Load font before assigning characters
          try {
            await figma.loadFontAsync({ family: node.fontFamily || 'Inter', style: fontStyle });
            text.fontName = { family: node.fontFamily || 'Inter', style: fontStyle };
          } catch {
            // Fallback to Inter Regular if requested font is not loaded/available
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            text.fontName = { family: 'Inter', style: 'Regular' };
          }

          text.resize(node.width, node.height || 100);
          text.x = node.x;
          text.y = node.y;
          text.characters = node.text;
          text.fills = [{ type: 'SOLID', color: hexToRgb(node.color) }];
          text.fontSize = node.fontSize;
          text.lineHeight = { value: node.fontSize * (node.lineHeight || 1.2), unit: 'PIXELS' };

          if (node.align) {
            text.textAlignHorizontal = node.align.toUpperCase() as
              'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
          }

          frame.appendChild(text);
        } else if (node.type === 'illustration') {
          // Create illustration group frame
          const illFrame = figma.createFrame();
          illFrame.name = `Illustration: ${node.key}`;
          illFrame.resize(node.width, node.height);
          illFrame.x = node.x;
          illFrame.y = node.y;
          illFrame.backgrounds = []; // transparent background

          // Draw procedural lines and shapes
          if (node.key === 'analytics-chart') {
            // Draw grid lines
            for (let j = 1; j < 4; j++) {
              const line = figma.createLine();
              line.resize(node.width - 40, 0);
              line.x = 20;
              line.y = (node.height / 4) * j;
              line.strokes = [{ type: 'SOLID', color: hexToRgb('#f1f5f9') }];
              line.opacity = 0.1;
              illFrame.appendChild(line);
            }

            // Draw line graph path
            const line = figma.createVector();
            line.name = 'Graph Line';
            // Simple straight lines
            const lineNode = figma.createLine();
            lineNode.resize(node.width - 60, 0);
            lineNode.x = 30;
            lineNode.y = node.height / 2;
            lineNode.strokes = [{ type: 'SOLID', color: hexToRgb('#6366f1') }];
            lineNode.strokeWeight = 4;
            illFrame.appendChild(lineNode);

            // Draw glowing node circles
            const c1 = figma.createEllipse();
            c1.resize(12, 12);
            c1.x = 30;
            c1.y = node.height / 2 - 6;
            c1.fills = [{ type: 'SOLID', color: hexToRgb('#6366f1') }];
            illFrame.appendChild(c1);

            const c2 = figma.createEllipse();
            c2.resize(16, 16);
            c2.x = node.width - 46;
            c2.y = node.height / 2 - 8;
            c2.fills = [{ type: 'SOLID', color: hexToRgb('#10b981') }];
            illFrame.appendChild(c2);
          } else if (node.key === 'quote-marks') {
            const marks = figma.createText();
            await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
            marks.fontName = { family: 'Inter', style: 'Bold' };
            marks.characters = '“';
            marks.fontSize = Math.min(node.width, node.height) * 0.8;
            marks.fills = [{ type: 'SOLID', color: hexToRgb('#6366f1') }];
            marks.opacity = 0.15;
            marks.x = 10;
            marks.y = 10;
            illFrame.appendChild(marks);
          } else {
            // Draw default circle representation
            const ellipse = figma.createEllipse();
            ellipse.resize(node.width * 0.5, node.height * 0.5);
            ellipse.x = node.width * 0.25;
            ellipse.y = node.height * 0.25;
            ellipse.fills = [{ type: 'SOLID', color: hexToRgb('#6366f1') }];
            illFrame.appendChild(ellipse);
          }

          frame.appendChild(illFrame);
        }
      }

      nodes.push(frame);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.closePlugin('🎉 Carousel generated successfully!');
  }
};
