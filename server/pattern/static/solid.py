from pattern.color import *
from pattern.pattern import *
from pattern.util import KEY_MODEL, KEY_COLOR_MAPPING_1, KEY_COLOR_MAPPING_2
from PIL import Image, ImageChops

import math

class ColorBump(StaticPattern):
  DEFAULT_PARAMS = {
    'Color 1': BLACK,
    'Color 2': BLUE,
    '100Duty': 50
  }

  def paramUpdate(self, paramName):
    StaticPattern.paramUpdate(self, paramName)
    self.params['Duty'] = self.params['100Duty'] / 100.0

  def renderFrame(self, device):
    im = Image.new('RGB', (device.width, device.height))
    len1 = int(self.params['Duty'] * device.width)
    len2 = device.width - len1
    datarow = [getWeightedColorSum(self.params['Color 1'], self.params['Color 2'],
      (1 + math.sin(x * math.pi / len1)) / 2).getRGBValues()
      for x in range(len1)] + [getWeightedColorSum(self.params['Color 2'], self.params['Color 1'],
      (1 + math.sin(x * math.pi / len2)) / 2).getRGBValues()
      for x in range(len2)]
    im.putdata(datarow * device.height)
    return im

class ColorSpike(StaticPattern):
  DEFAULT_PARAMS = {
    'Background': BLACK,
    'Color': BLUE,
    '100Duty': 20
  }

  def paramUpdate(self, paramName):
    StaticPattern.paramUpdate(self, paramName)
    self.params['Duty'] = self.params['100Duty'] / 100.0

  def renderFrame(self, device):
    im = Image.new('RGB', (device.width, device.height))
    len1 = int(self.params['Duty'] * device.width)
    len2 = device.width - len1
    datarow = [getWeightedColorSum(self.params['Background'], self.params['Color'], float(x) / len1
      ).getRGBValues() for x in range(len1)] + [self.params['Background'].getRGBValues()] * len2
    im.putdata(datarow * device.height)
    return im

class Checkerboard(StaticPattern):
  DEFAULT_PARAMS = {
    'Color 1': BLACK,
    'Color 2': WHITE,
    'Grain': 3,
    'Offset': False
  }

  def renderFrame(self, device):
    im = Image.new('RGB', (device.width, device.height))
    im.putdata([self.params['Color 1'].getRGBValues()
      if ((y / self.params['Grain'] % 2) != (x / self.params['Grain'] % 2)) != self.params['Offset']
      else self.params['Color 2'].getRGBValues()
      for y in range(device.height) for x in range(device.width)])
    return im

class SolidColor(StaticPattern):
  DEFAULT_PARAMS = {
    'Color': BLUE
  }
  
  def renderFrame(self, device):
    im = Image.new('RGB', (device.width, device.height))
    im.putdata([self.params['Color'].getRGBValues()] * (device.width * device.height))
    return im

class HSVColor(StaticPattern):
  DEFAULT_PARAMS = {
    '1000H': 500,
    '1000S': 1000,
    '1000V': 1000,
  }

  def renderFrame(self, device):
    im = Image.new('RGB', (device.width, device.height))

    hsv = (self.params['1000H']/1000.0, self.params['1000S']/1000.0, (self.params['1000V']/1000.0) * 255)
    color = Color(hsv, isHSV = True)
    im.putdata([color.getRGBValues()] * (device.width * device.height))
    return im

class RGBColor(StaticPattern):
  DEFAULT_PARAMS = {
    'R': 0,
    'G': 0,
    'B': 255,
  }

  def renderFrame(self, device):
    im = Image.new('RGB', (device.width, device.height))
    rgb = (self.params['R'], self.params['G'], self.params['B'])
    im.putdata([rgb] * (device.width * device.height))
    return im

class LinearRainbow(StaticPattern):
  DEFAULT_PARAMS = {
    'Horizontal': True,
    '100StartHue': 0,
    '100EndHue': 100,
  } # Hues can and should go above 1 if you want wrapping.

  def renderFrame(self, device):
    if self.params['Horizontal']:
      wid = device.width
      hei = device.height
    else:
      wid = device.height
      hei = device.width
    huerange = [self.params['100StartHue'] / 100.0 + (self.params['100EndHue'] - self.params['100StartHue']) * i / (100.0 * wid) for i in range(wid)]
    colorArr = [Color((hue, 1, 255), isHSV=True).getRGBValues() for hue in huerange]
    im = Image.new('RGB', (wid, hei))
    im.putdata(colorArr * hei)
    if not self.params['Horizontal']: im = im.transpose(Image.ROTATE_270).transpose(Image.FLIP_LEFT_RIGHT)
    return im

class KeyColor(TimedPattern):
  DEFAULT_PARAMS = {
    'Fading': True,
    'Mapping': 1
  }

  DEFAULT_PARAMS.update(TimedPattern.DEFAULT_PARAMS)

  def __init__(self, params):
    TimedPattern.__init__(self, params)
    self.lastColor = BLACK
    self.lastFrame = 0

  def renderFrame(self, device, frameCount):
    im = Image.new('RGB', (device.width, device.height))

    if self.params['Mapping'] == 1:
      mapping = KEY_COLOR_MAPPING_1
    else:
      mapping = KEY_COLOR_MAPPING_2

    color = BLACK
    for key in KEY_MODEL.downKeys:
      color += mapping[key]

    if self.params['Fading']:
      if color != BLACK:
        self.lastColor = color
        self.lastFrame = frameCount
      else:
        color = self.lastColor * (1 - min(((frameCount - self.lastFrame) / 10.0), 1))

    im.putdata([color.getRGBValues()] * (device.width * device.height))

    return im
