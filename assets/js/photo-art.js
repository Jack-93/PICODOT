(function () {
  "use strict";

  var canvas = document.querySelector("[data-photo-art-canvas]");

  if (!canvas) {
    return;
  }

  var elements = {
    canvas: canvas,
    fileInput: document.querySelector("[data-photo-art-input]"),
    fileButton: document.querySelector("[data-photo-art-file]"),
    dropZone: document.querySelector("[data-photo-art-drop]"),
    sourcePreview: document.querySelector("[data-photo-art-source]"),
    sourceEmpty: document.querySelector("[data-photo-art-source-empty]"),
    fileSummary: document.querySelector("[data-photo-art-summary]"),
    status: document.querySelector("[data-photo-art-status]"),
    reset: document.querySelector("[data-photo-art-reset]"),
    download: document.querySelector("[data-photo-art-download]"),
    settings: document.querySelectorAll("[data-photo-art-setting]"),
    colors: document.querySelectorAll("[data-photo-art-color]")
  };
  var context = canvas.getContext("2d");
  var workCanvas = document.createElement("canvas");
  var work = workCanvas.getContext("2d");
  var sampleUrl = "assets/images/samples/photo-pixel-cat.webp";
  var storageKey = "picodot-photo-art-settings-v1";
  var defaultSettings = {
    fur: "#f3a24d",
    light: "#fff8ea",
    dark: "#4f4d28",
    accent: "#ef8e89",
    background: "#ffe0a8",
    pattern: "stripes",
    expression: "sleepy"
  };
  var state = {
    fileName: "picodot-orange-cat",
    isSample: true,
    sourceUrl: ""
  };

  workCanvas.width = 96;
  workCanvas.height = 96;
  canvas.width = 1200;
  canvas.height = 1200;

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function toHex(red, green, blue) {
    return "#" + [red, green, blue].map(function (channel) {
      return Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0");
    }).join("");
  }

  function hexToRgb(hex) {
    var normalized = hex.replace("#", "");
    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16)
    ];
  }

  function mix(color, target, amount) {
    var source = hexToRgb(color);
    var destination = hexToRgb(target);
    return toHex(
      source[0] + (destination[0] - source[0]) * amount,
      source[1] + (destination[1] - source[1]) * amount,
      source[2] + (destination[2] - source[2]) * amount
    );
  }

  function luminance(red, green, blue) {
    return 0.299 * red + 0.587 * green + 0.114 * blue;
  }

  function saturation(red, green, blue) {
    var maximum = Math.max(red, green, blue);
    var minimum = Math.min(red, green, blue);
    return maximum === 0 ? 0 : (maximum - minimum) / maximum;
  }

  function getSettings() {
    var settings = {};

    elements.settings.forEach(function (control) {
      settings[control.dataset.photoArtSetting] = control.value;
    });
    elements.colors.forEach(function (control) {
      settings[control.dataset.photoArtColor] = control.value;
    });

    return settings;
  }

  function applySettings(settings, shouldSave) {
    elements.settings.forEach(function (control) {
      var value = settings[control.dataset.photoArtSetting];
      if (value) {
        control.value = value;
      }
    });
    elements.colors.forEach(function (control) {
      var value = settings[control.dataset.photoArtColor];
      if (value) {
        control.value = value;
      }
    });

    if (shouldSave) {
      saveSettings();
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(getSettings()));
    } catch (error) {
      // The maker still works when browser storage is unavailable.
    }
  }

  function setStatus(message, isError) {
    elements.status.textContent = message;
    elements.status.classList.toggle("is-error", Boolean(isError));
  }

  function fillRect(x, y, width, height, color) {
    work.fillStyle = color;
    work.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }

  function polygon(points, color) {
    work.fillStyle = color;
    work.beginPath();
    points.forEach(function (point, index) {
      if (index === 0) {
        work.moveTo(point[0], point[1]);
      } else {
        work.lineTo(point[0], point[1]);
      }
    });
    work.closePath();
    work.fill();
  }

  function drawBackground(settings) {
    fillRect(0, 0, 96, 96, mix(settings.background, "#ffffff", 0.12));
    polygon([[0, 0], [44, 0], [0, 47]], mix(settings.background, "#ffffff", 0.02));
    polygon([[44, 0], [68, 0], [0, 70], [0, 47]], mix(settings.background, "#fff4cc", 0.42));
    polygon([[68, 0], [96, 0], [96, 31], [27, 96], [0, 96], [0, 70]], mix(settings.background, "#fffbe8", 0.58));
    polygon([[96, 31], [96, 96], [27, 96]], mix(settings.background, "#bde9ff", 0.62));
    fillRect(14, 15, 2, 2, "#eaf2e8");
    fillRect(18, 12, 2, 2, "#eaf2e8");
    fillRect(82, 17, 3, 2, "#e7eee1");
    fillRect(87, 12, 2, 2, "#e7eee1");
  }

  function drawCat(settings) {
    var furShadow = mix(settings.fur, "#8b4f27", 0.38);
    var furLight = mix(settings.fur, "#ffd997", 0.28);
    var lightShadow = mix(settings.light, "#cdbda9", 0.2);

    polygon([[16, 29], [19, 12], [25, 15], [37, 29]], furShadow);
    polygon([[80, 29], [77, 12], [71, 15], [59, 29]], furShadow);
    polygon([[19, 29], [21, 15], [26, 19], [34, 31]], settings.fur);
    polygon([[77, 29], [75, 15], [70, 19], [62, 31]], settings.fur);
    polygon([[22, 28], [23, 17], [29, 23], [33, 31]], mix(settings.accent, "#ffffff", 0.35));
    polygon([[74, 28], [73, 17], [67, 23], [63, 31]], mix(settings.accent, "#ffffff", 0.35));

    polygon([
      [24, 27], [34, 24], [62, 24], [72, 27], [78, 38], [78, 59],
      [72, 72], [63, 80], [33, 80], [24, 72], [18, 59], [18, 38]
    ], furShadow);
    polygon([
      [27, 27], [37, 25], [59, 25], [69, 28], [75, 39], [75, 58],
      [69, 69], [60, 76], [36, 76], [27, 69], [21, 58], [21, 39]
    ], settings.fur);
    fillRect(24, 42, 6, 15, furLight);
    fillRect(66, 42, 6, 15, furLight);

    if (settings.pattern === "stripes") {
      fillRect(43, 27, 3, 9, furShadow);
      fillRect(50, 27, 3, 9, furShadow);
      fillRect(39, 31, 3, 7, furShadow);
      fillRect(54, 31, 3, 7, furShadow);
      fillRect(24, 38, 8, 3, furShadow);
      fillRect(64, 38, 8, 3, furShadow);
      fillRect(22, 46, 7, 3, furShadow);
      fillRect(67, 46, 7, 3, furShadow);
    } else if (settings.pattern === "spots") {
      fillRect(31, 31, 7, 6, furShadow);
      fillRect(59, 37, 8, 7, furShadow);
      fillRect(25, 52, 6, 5, furShadow);
      fillRect(64, 57, 7, 5, furShadow);
    }

    polygon([
      [43, 38], [50, 38], [53, 46], [61, 50], [66, 61], [63, 70],
      [56, 76], [40, 76], [33, 70], [30, 61], [35, 50], [42, 46]
    ], settings.light);
    fillRect(36, 53, 25, 17, settings.light);
    fillRect(33, 59, 31, 10, settings.light);
    fillRect(38, 69, 20, 9, settings.light);
    fillRect(29, 57, 7, 8, mix(settings.light, settings.fur, 0.15));
    fillRect(61, 57, 7, 8, mix(settings.light, settings.fur, 0.15));

    if (settings.expression === "sleepy") {
      fillRect(31, 50, 12, 2, settings.dark);
      fillRect(54, 50, 12, 2, settings.dark);
      fillRect(34, 52, 7, 2, mix(settings.dark, "#ffffff", 0.18));
      fillRect(56, 52, 7, 2, mix(settings.dark, "#ffffff", 0.18));
    } else if (settings.expression === "bright") {
      fillRect(32, 48, 10, 8, settings.dark);
      fillRect(55, 48, 10, 8, settings.dark);
      fillRect(35, 49, 3, 3, "#ffffff");
      fillRect(58, 49, 3, 3, "#ffffff");
    } else {
      fillRect(32, 49, 11, 5, settings.dark);
      fillRect(54, 49, 11, 5, settings.dark);
      fillRect(35, 49, 3, 2, "#ffffff");
      fillRect(57, 49, 3, 2, "#ffffff");
    }

    fillRect(45, 59, 7, 4, settings.accent);
    fillRect(47, 63, 3, 3, lightShadow);
    fillRect(40, 66, 8, 2, lightShadow);
    fillRect(49, 66, 8, 2, lightShadow);

    fillRect(11, 61, 22, 2, settings.dark);
    fillRect(13, 67, 20, 2, settings.dark);
    fillRect(64, 61, 22, 2, settings.dark);
    fillRect(64, 67, 20, 2, settings.dark);
    fillRect(18, 57, 13, 2, mix(settings.dark, "#ffffff", 0.38));
    fillRect(66, 57, 13, 2, mix(settings.dark, "#ffffff", 0.38));

    polygon([[29, 72], [38, 70], [58, 70], [67, 72], [72, 96], [24, 96]], settings.light);
    fillRect(31, 77, 34, 19, settings.light);
    fillRect(26, 84, 12, 12, mix(settings.light, "#ffffff", 0.16));
    fillRect(58, 84, 12, 12, mix(settings.light, "#ffffff", 0.16));
    fillRect(42, 78, 12, 18, mix(settings.light, "#ffffff", 0.08));
  }

  function drawTemplate() {
    var settings = getSettings();

    work.clearRect(0, 0, workCanvas.width, workCanvas.height);
    work.imageSmoothingEnabled = false;
    drawBackground(settings);
    drawCat(settings);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(workCanvas, 0, 0, canvas.width, canvas.height);
    canvas.dataset.renderSignature = [
      settings.fur,
      settings.light,
      settings.dark,
      settings.accent,
      settings.background,
      settings.pattern,
      settings.expression
    ].join("|");
  }

  function drawSample() {
    var image = new Image();
    image.onload = function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.dataset.renderSignature = "sample";
    };
    image.src = sampleUrl;
  }

  function getAverageColor(pixels) {
    if (!pixels.length) {
      return [128, 128, 128];
    }

    var totals = pixels.reduce(function (result, pixel) {
      result[0] += pixel[0];
      result[1] += pixel[1];
      result[2] += pixel[2];
      return result;
    }, [0, 0, 0]);

    return totals.map(function (total) {
      return total / pixels.length;
    });
  }

  function selectPrimaryColor(pixels) {
    var buckets = {};

    pixels.forEach(function (pixel) {
      var sat = saturation(pixel[0], pixel[1], pixel[2]);
      var light = luminance(pixel[0], pixel[1], pixel[2]);

      if (light < 35 || light > 242 || sat < 0.08) {
        return;
      }

      var key = [
        Math.round(pixel[0] / 24) * 24,
        Math.round(pixel[1] / 24) * 24,
        Math.round(pixel[2] / 24) * 24
      ].join(",");

      if (!buckets[key]) {
        buckets[key] = { score: 0, colors: [] };
      }
      buckets[key].score += 1 + sat * 2;
      buckets[key].colors.push(pixel);
    });

    var selected = Object.keys(buckets).sort(function (first, second) {
      return buckets[second].score - buckets[first].score;
    })[0];

    return selected ? getAverageColor(buckets[selected].colors) : getAverageColor(pixels);
  }

  function analyzeImage(image) {
    var analysisCanvas = document.createElement("canvas");
    var analysis = analysisCanvas.getContext("2d", { willReadFrequently: true });
    var size = 72;
    var sourceWidth = image.naturalWidth;
    var sourceHeight = image.naturalHeight;
    var cropSize = Math.min(sourceWidth, sourceHeight);
    var sourceX = (sourceWidth - cropSize) / 2;
    var sourceY = Math.max(0, (sourceHeight - cropSize) * 0.32);

    analysisCanvas.width = size;
    analysisCanvas.height = size;
    analysis.drawImage(
      image,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      size,
      size
    );

    var data = analysis.getImageData(0, 0, size, size).data;
    var central = [];
    var lightPixels = [];
    var darkPixels = [];

    for (var y = 8; y < 64; y += 1) {
      for (var x = 10; x < 62; x += 1) {
        var index = (y * size + x) * 4;
        var pixel = [data[index], data[index + 1], data[index + 2]];
        var light = luminance(pixel[0], pixel[1], pixel[2]);
        var distance = Math.hypot(x - size / 2, y - size * 0.43);

        if (distance < 31) {
          central.push(pixel);
        }
        if (y > 27 && distance < 27 && light > 168) {
          lightPixels.push(pixel);
        }
        if (y > 20 && y < 50 && distance < 28 && light < 100) {
          darkPixels.push(pixel);
        }
      }
    }

    var primary = selectPrimaryColor(central);
    var lightColor = lightPixels.length > 12
      ? getAverageColor(lightPixels)
      : [244, 237, 220];
    var darkColor = darkPixels.length > 8
      ? getAverageColor(darkPixels)
      : primary.map(function (channel) { return channel * 0.38; });
    var furHex = toHex(primary[0], primary[1], primary[2]);
    var lightHex = toHex(lightColor[0], lightColor[1], lightColor[2]);
    var darkHex = toHex(darkColor[0], darkColor[1], darkColor[2]);

    return {
      fur: mix(furHex, "#f3a24d", 0.12),
      light: mix(lightHex, "#fff8ea", 0.24),
      dark: mix(darkHex, "#3f3b24", 0.25),
      accent: mix(furHex, "#ef8e89", 0.72),
      background: mix(furHex, "#fff1c9", 0.75),
      pattern: "stripes",
      expression: "sleepy"
    };
  }

  function setSourcePreview(url, alt) {
    elements.sourcePreview.src = url;
    elements.sourcePreview.alt = alt;
    elements.sourcePreview.hidden = false;
    elements.sourceEmpty.hidden = true;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return Math.max(1, Math.round(bytes / 1024)) + "KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + "MB";
  }

  function handleFile(file) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus("JPG, PNG 또는 WEBP 사진을 선택해 주세요.", true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus("10MB 이하의 사진을 선택해 주세요.", true);
      return;
    }

    var objectUrl = URL.createObjectURL(file);
    var image = new Image();

    image.onload = function () {
      if (
        !image.naturalWidth ||
        !image.naturalHeight ||
        image.naturalWidth * image.naturalHeight > 60000000
      ) {
        setStatus("6천만 화소 이하의 사진을 선택해 주세요.", true);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      if (state.sourceUrl) {
        URL.revokeObjectURL(state.sourceUrl);
      }
      state.sourceUrl = objectUrl;
      state.fileName = file.name.replace(/\.[^.]+$/, "") || "picodot-cat";
      state.isSample = false;
      applySettings(analyzeImage(image), true);
      setSourcePreview(objectUrl, "분석할 원본 사진");
      elements.fileSummary.textContent = [
        file.name,
        formatFileSize(file.size),
        image.naturalWidth + " × " + image.naturalHeight + "px"
      ].join(" · ");
      drawTemplate();
      setStatus("사진의 대표 색감을 분석해 픽셀 고양이에 적용했어요.");
    };

    image.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      setStatus("사진을 읽지 못했습니다. 다른 파일을 선택해 주세요.", true);
    };
    image.src = objectUrl;
  }

  function reset() {
    if (state.sourceUrl) {
      URL.revokeObjectURL(state.sourceUrl);
      state.sourceUrl = "";
    }
    state.fileName = "picodot-orange-cat";
    state.isSample = true;
    elements.fileInput.value = "";
    elements.sourcePreview.hidden = true;
    elements.sourcePreview.removeAttribute("src");
    elements.sourceEmpty.hidden = false;
    elements.fileSummary.textContent = "샘플 픽셀 고양이 · 1200 × 1200px";
    applySettings(defaultSettings, true);
    drawSample();
    setStatus("샘플 미리보기가 준비되어 있어요.");
  }

  function download() {
    var link = document.createElement("a");
    link.download = state.fileName + "-picodot-art.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setStatus("1200px PNG 다운로드를 시작했어요.");
  }

  function bindEvents() {
    elements.fileButton.addEventListener("click", function () {
      elements.fileInput.click();
    });
    elements.fileInput.addEventListener("change", function () {
      handleFile(elements.fileInput.files[0]);
    });
    ["dragenter", "dragover"].forEach(function (eventName) {
      elements.dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        elements.dropZone.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      elements.dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        elements.dropZone.classList.remove("is-dragging");
      });
    });
    elements.dropZone.addEventListener("drop", function (event) {
      handleFile(event.dataTransfer.files[0]);
    });
    elements.settings.forEach(function (control) {
      control.addEventListener("change", function () {
        state.isSample = false;
        saveSettings();
        drawTemplate();
        setStatus("선택한 스타일을 미리보기에 적용했어요.");
      });
    });
    elements.colors.forEach(function (control) {
      control.addEventListener("input", function () {
        state.isSample = false;
        saveSettings();
        drawTemplate();
        setStatus("색상을 미리보기에 적용했어요.");
      });
    });
    elements.reset.addEventListener("click", reset);
    elements.download.addEventListener("click", download);
  }

  bindEvents();
  reset();
})();
