import numpy
import threading

BUFFER_SIZE = 4
NUM_BANDS = 48

ALL_THE_KEYS = ['q','w','e','r','t','y','u','i','o','p','[',']','a','s','d','f','g','h','j','k','l',';',"'",'z','x','c','v','b','n','m',',','.','/','up','down','left','right','tab','enter','del','backspace','space']

class BeatModel():
  def __init__(self, buffer_size=BUFFER_SIZE, num_bands=NUM_BANDS):
    self.buffer_size = buffer_size
    self.num_bands = num_bands

    self.centroids = [0] * buffer_size
    self.volumes = [0] * buffer_size
    self.frequencies = [[0] * num_bands] * buffer_size

    self.avgVolume = 0
    self.avgCentroid = 0
    self.avgFreqs = [0] * num_bands

  def getNormalizedCentroids(self, index):
    cMin = min(self.centroids)
    cMax = max(self.centroids)
    cCent = self.centroids[index]

    if (cMax - cMin) == 0:
      normCent = 0
    else:
      normCent = (cCent - cMin) / (cMax - cMin)
    return normCent

  def updateData(self, centroid, volume, frequencies):
    self.centroids.pop()
    self.volumes.pop()
    self.frequencies.pop()

    self.centroids.insert(0, centroid)
    self.volumes.insert(0, volume)
    self.frequencies.insert(0, frequencies)

    self.avgVolume = float(numpy.mean(self.volumes))
    self.avgCentroid = float(numpy.mean(self.centroids))
    newAvgFreq = []
    for i in range(self.num_bands):
      total = 0
      for j in range(self.buffer_size):
        total += self.frequencies[j][i]
      newAvgFreq.append(total / self.buffer_size)
    self.avgFreqs = newAvgFreq

class KeyModel():
  def __init__(self):
    self.downKeys = []
    self.upKeys = ALL_THE_KEYS[:]
    self.newestKey = None
    self.lock = threading.Lock()

  def downKey(self, key):
    self.lock.acquire()
    if key in self.upKeys:
      self.upKeys.remove(key)

    if key not in self.downKeys:
      self.downKeys.append(key)

    self.newestKey = key
    self.lock.release()

  def upKey(self, key):
    self.lock.acquire()
    if key in self.downKeys:
      self.downKeys.remove(key)

    if key not in self.upKeys:
      self.upKeys.append(key)
    self.lock.release()