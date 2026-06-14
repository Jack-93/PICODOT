(function () {
  "use strict";

  var elements = {
    fileInput: document.querySelector("[data-file-input]"),
    fileButton: document.querySelector("[data-file-button]"),
    dropZone: document.querySelector("[data-drop-zone]"),
    uploadPrompt: document.querySelector("[data-upload-prompt]"),
    canvas: document.querySelector("[data-output-canvas]"),
    originalCanvas: document.querySelector("[data-original-canvas]"),
    canvasBadge: document.querySelector("[data-canvas-badge]"),
    previewButtons: document.querySelectorAll("[data-preview-mode]"),
    presetButtons: document.querySelectorAll("[data-preset]"),
    pixelSize: document.querySelector("[data-pixel-size]"),
    colorCount: document.querySelector("[data-color-count]"),
    colorDiversity: document.querySelector("[data-color-diversity]"),
    pixelOutput: document.querySelector("[data-pixel-output]"),
    colorOutput: document.querySelector("[data-color-output]"),
    diversityOutput: document.querySelector("[data-diversity-output]"),
    download: document.querySelector("[data-download]"),
    reset: document.querySelector("[data-reset]"),
    status: document.querySelector("[data-status]"),
    fileSummary: document.querySelector("[data-file-summary]")
  };

  var state = {
    source: null,
    fileName: "pico-dot-sample",
    isSample: true,
    renderFrame: null,
    previewMode: "result"
  };

  var defaultSettings = {
    pixelWidth: 48,
    colors: 16,
    colorDiversity: 110
  };
  var settingsStorageKey = "pico-dot-settings-v1";

  function setCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function setStatus(message, isError) {
    if (!elements.status) {
      return;
    }

    elements.status.textContent = message;
    elements.status.classList.toggle("is-error", Boolean(isError));
  }

  function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "";
    }

    if (bytes < 1024 * 1024) {
      return Math.max(1, Math.round(bytes / 1024)) + "KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + "MB";
  }

  function setFileSummary(file, width, height) {
    if (!elements.fileSummary) {
      return;
    }

    if (!file) {
      elements.fileSummary.textContent = "샘플 이미지 · 640 × 640px";
      return;
    }

    elements.fileSummary.textContent = [
      file.name,
      formatFileSize(file.size),
      width + " × " + height + "px"
    ].filter(Boolean).join(" · ");
  }

  function createSampleCanvas() {
    var sample = document.createElement("canvas");
    var context = sample.getContext("2d");
    var size = 640;

    sample.width = size;
    sample.height = size;

    var gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#ffd8a8");
    gradient.addColorStop(0.48, "#fff2c7");
    gradient.addColorStop(1, "#a5d8ff");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    context.fillStyle = "#91c788";
    context.fillRect(0, 480, size, 160);
    context.fillStyle = "#609966";
    context.fillRect(0, 545, size, 95);

    context.fillStyle = "#c78655";
    context.beginPath();
    context.moveTo(165, 225);
    context.lineTo(215, 92);
    context.lineTo(288, 214);
    context.fill();
    context.beginPath();
    context.moveTo(352, 214);
    context.lineTo(427, 92);
    context.lineTo(478, 226);
    context.fill();

    context.fillStyle = "#d99a68";
    context.beginPath();
    context.ellipse(320, 330, 190, 170, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#f4c18e";
    context.beginPath();
    context.ellipse(320, 350, 135, 118, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#543827";
    context.fillRect(228, 300, 45, 25);
    context.fillRect(367, 300, 45, 25);
    context.fillStyle = "#30231c";
    context.fillRect(245, 300, 12, 34);
    context.fillRect(383, 300, 12, 34);

    context.fillStyle = "#ff8066";
    context.beginPath();
    context.moveTo(302, 365);
    context.lineTo(338, 365);
    context.lineTo(320, 386);
    context.fill();

    context.strokeStyle = "#6f4930";
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(320, 386);
    context.lineTo(320, 407);
    context.moveTo(320, 406);
    context.quadraticCurveTo(292, 430, 270, 408);
    context.moveTo(320, 406);
    context.quadraticCurveTo(348, 430, 370, 408);
    context.stroke();

    context.lineWidth = 6;
    [[120, 365, 255, 385], [115, 402, 252, 410], [385, 385, 525, 365], [388, 410, 530, 404]]
      .forEach(function (line) {
        context.beginPath();
        context.moveTo(line[0], line[1]);
        context.lineTo(line[2], line[3]);
        context.stroke();
      });

    context.fillStyle = "#ffffff";
    context.fillRect(80, 105, 18, 18);
    context.fillRect(103, 82, 11, 11);
    context.fillRect(525, 145, 16, 16);
    context.fillRect(550, 119, 10, 10);

    return sample;
  }

  function readSavedSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(settingsStorageKey));

      if (!saved || typeof saved !== "object") {
        return null;
      }

      var savedPixelWidth = Number(saved.pixelWidth);
      var savedColors = Number(saved.colors);
      var savedColorDiversity = Number(saved.colorDiversity);

      return {
        pixelWidth: clamp(
          Number.isFinite(savedPixelWidth) ? savedPixelWidth : defaultSettings.pixelWidth,
          16,
          96
        ),
        colors: clamp(
          Number.isFinite(savedColors) ? savedColors : defaultSettings.colors,
          2,
          64
        ),
        colorDiversity: clamp(
          Number.isFinite(savedColorDiversity)
            ? savedColorDiversity
            : defaultSettings.colorDiversity,
          0,
          180
        )
      };
    } catch (error) {
      return null;
    }
  }

  function saveSettings() {
    try {
      var settings = getSettings();
      localStorage.setItem(settingsStorageKey, JSON.stringify({
        pixelWidth: settings.pixelWidth,
        colors: settings.colors,
        colorDiversity: Math.round(settings.colorDiversity * 100)
      }));
    } catch (error) {
      // Converter remains usable when browser storage is unavailable.
    }
  }

  function applySettings(settings, shouldSave) {
    elements.pixelSize.value = String(settings.pixelWidth);
    elements.colorCount.value = String(settings.colors);
    elements.colorDiversity.value = String(settings.colorDiversity);
    updateOutputs();
    updatePresetState();

    if (shouldSave) {
      saveSettings();
    }
  }

  function restoreSettings() {
    applySettings(readSavedSettings() || defaultSettings, false);
  }

  function getSettings() {
    return {
      pixelWidth: Number(elements.pixelSize.value),
      colors: Number(elements.colorCount.value),
      colorDiversity: Number(elements.colorDiversity.value) / 100
    };
  }

  function adjustSaturation(red, green, blue, amount) {
    var gray = 0.299 * red + 0.587 * green + 0.114 * blue;

    return [
      clamp(gray + (red - gray) * amount, 0, 255),
      clamp(gray + (green - gray) * amount, 0, 255),
      clamp(gray + (blue - gray) * amount, 0, 255)
    ];
  }

  function getChannelRange(colors, channel) {
    var minimum = 255;
    var maximum = 0;

    colors.forEach(function (color) {
      minimum = Math.min(minimum, color[channel]);
      maximum = Math.max(maximum, color[channel]);
    });

    return maximum - minimum;
  }

  function createPalette(data, colorCount) {
    var colors = [];

    for (var index = 0; index < data.length; index += 4) {
      colors.push([data[index], data[index + 1], data[index + 2]]);
    }

    var boxes = [colors];

    while (boxes.length < colorCount) {
      var boxIndex = -1;
      var channelIndex = 0;
      var largestScore = -1;

      boxes.forEach(function (box, index) {
        if (box.length < 2) {
          return;
        }

        var ranges = [
          getChannelRange(box, 0),
          getChannelRange(box, 1),
          getChannelRange(box, 2)
        ];
        var maxRange = Math.max.apply(null, ranges);
        var score = maxRange * box.length;

        if (score > largestScore) {
          largestScore = score;
          boxIndex = index;
          channelIndex = ranges.indexOf(maxRange);
        }
      });

      if (boxIndex === -1) {
        break;
      }

      var boxToSplit = boxes.splice(boxIndex, 1)[0];
      boxToSplit.sort(function (first, second) {
        return first[channelIndex] - second[channelIndex];
      });

      var middle = Math.ceil(boxToSplit.length / 2);
      boxes.push(boxToSplit.slice(0, middle), boxToSplit.slice(middle));
    }

    return boxes.map(function (box) {
      var totals = box.reduce(function (result, color) {
        result[0] += color[0];
        result[1] += color[1];
        result[2] += color[2];
        return result;
      }, [0, 0, 0]);

      return totals.map(function (total) {
        return Math.round(total / box.length);
      });
    });
  }

  function findNearestColor(red, green, blue, palette) {
    var nearest = palette[0];
    var nearestDistance = Infinity;

    palette.forEach(function (color) {
      var redDifference = red - color[0];
      var greenDifference = green - color[1];
      var blueDifference = blue - color[2];
      var distance =
        redDifference * redDifference +
        greenDifference * greenDifference +
        blueDifference * blueDifference;

      if (distance < nearestDistance) {
        nearest = color;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  function processPixels(context, width, height, settings) {
    var imageData = context.getImageData(0, 0, width, height);
    var data = imageData.data;

    for (var index = 0; index < data.length; index += 4) {
      var saturated = adjustSaturation(
        data[index],
        data[index + 1],
        data[index + 2],
        settings.colorDiversity
      );

      data[index] = saturated[0];
      data[index + 1] = saturated[1];
      data[index + 2] = saturated[2];
    }

    var palette = createPalette(data, settings.colors);

    for (var pixelIndex = 0; pixelIndex < data.length; pixelIndex += 4) {
      var nearest = findNearestColor(
        data[pixelIndex],
        data[pixelIndex + 1],
        data[pixelIndex + 2],
        palette
      );

      data[pixelIndex] = nearest[0];
      data[pixelIndex + 1] = nearest[1];
      data[pixelIndex + 2] = nearest[2];
    }

    context.putImageData(imageData, 0, 0);
  }

  function renderPixelArt() {
    if (!elements.canvas || !state.source) {
      return;
    }

    var settings = getSettings();
    var sourceWidth = state.source.naturalWidth || state.source.width;
    var sourceHeight = state.source.naturalHeight || state.source.height;
    var ratio = sourceHeight / sourceWidth;
    var smallWidth = settings.pixelWidth;
    var smallHeight = Math.max(1, Math.round(smallWidth * ratio));
    var outputScale = 1200 / Math.max(sourceWidth, sourceHeight);
    var outputWidth = Math.max(1, Math.round(sourceWidth * outputScale));
    var outputHeight = Math.max(1, Math.round(sourceHeight * outputScale));
    var smallCanvas = document.createElement("canvas");
    var smallContext = smallCanvas.getContext("2d", { willReadFrequently: true });
    var outputContext = elements.canvas.getContext("2d");

    smallCanvas.width = smallWidth;
    smallCanvas.height = smallHeight;
    smallContext.imageSmoothingEnabled = true;
    smallContext.drawImage(state.source, 0, 0, smallWidth, smallHeight);
    processPixels(smallContext, smallWidth, smallHeight, settings);

    elements.canvas.width = outputWidth;
    elements.canvas.height = outputHeight;
    outputContext.imageSmoothingEnabled = false;
    outputContext.clearRect(0, 0, outputWidth, outputHeight);
    outputContext.drawImage(smallCanvas, 0, 0, outputWidth, outputHeight);

    elements.canvas.style.aspectRatio = sourceWidth + " / " + sourceHeight;
    elements.canvas.classList.add("is-visible");
    elements.uploadPrompt.classList.add("is-hidden");
    elements.canvasBadge.textContent = state.isSample ? "샘플 미리보기" : "변환 완료";
    renderOriginalPreview(outputWidth, outputHeight, sourceWidth, sourceHeight);
    updatePreviewMode();
  }

  function renderOriginalPreview(outputWidth, outputHeight, sourceWidth, sourceHeight) {
    if (!elements.originalCanvas || !state.source) {
      return;
    }

    var context = elements.originalCanvas.getContext("2d");
    elements.originalCanvas.width = outputWidth;
    elements.originalCanvas.height = outputHeight;
    elements.originalCanvas.style.aspectRatio = sourceWidth + " / " + sourceHeight;
    context.imageSmoothingEnabled = true;
    context.clearRect(0, 0, outputWidth, outputHeight);
    context.drawImage(state.source, 0, 0, outputWidth, outputHeight);
  }

  function setPreviewMode(mode) {
    state.previewMode = mode === "original" ? "original" : "result";
    updatePreviewMode();
  }

  function updatePreviewMode() {
    var showOriginal = state.previewMode === "original";

    elements.canvas.classList.toggle("is-visible", !showOriginal);
    elements.originalCanvas.classList.toggle("is-visible", showOriginal);
    elements.canvasBadge.textContent = showOriginal
      ? "원본 사진"
      : state.isSample ? "샘플 미리보기" : "변환 완료";

    elements.previewButtons.forEach(function (button) {
      var isActive = button.dataset.previewMode === state.previewMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updatePresetState() {
    var settings = {
      pixelWidth: Number(elements.pixelSize.value),
      colors: Number(elements.colorCount.value),
      colorDiversity: Number(elements.colorDiversity.value)
    };

    elements.presetButtons.forEach(function (button) {
      var isActive =
        Number(button.dataset.pixel) === settings.pixelWidth &&
        Number(button.dataset.colors) === settings.colors &&
        Number(button.dataset.diversity) === settings.colorDiversity;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyPreset(button) {
    applySettings({
      pixelWidth: Number(button.dataset.pixel),
      colors: Number(button.dataset.colors),
      colorDiversity: Number(button.dataset.diversity)
    }, true);
    scheduleRender();
    setStatus(button.querySelector("strong").textContent + " 프리셋을 적용했어요.");
  }

  function scheduleRender() {
    if (state.renderFrame !== null) {
      cancelAnimationFrame(state.renderFrame);
    }

    state.renderFrame = requestAnimationFrame(function () {
      state.renderFrame = null;
      renderPixelArt();
    });
  }

  function updateOutputs() {
    if (!elements.pixelSize) {
      return;
    }

    elements.pixelOutput.textContent = elements.pixelSize.value;
    elements.colorOutput.textContent = elements.colorCount.value;
    elements.diversityOutput.textContent = elements.colorDiversity.value + "%";
  }

  function handleFile(file) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus("JPG, PNG 또는 WEBP 이미지를 선택해 주세요.", true);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus("10MB 이하의 이미지를 선택해 주세요.", true);
      return;
    }

    var image = new Image();
    var objectUrl = URL.createObjectURL(file);

    image.onload = function () {
      var width = image.naturalWidth;
      var height = image.naturalHeight;

      if (!width || !height || width > 16000 || height > 16000 || width * height > 60000000) {
        setStatus("이미지가 너무 큽니다. 6천만 화소 이하의 사진을 선택해 주세요.", true);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      state.source = image;
      state.fileName = file.name.replace(/\.[^.]+$/, "") || "pico-dot";
      state.isSample = false;
      renderPixelArt();
      setFileSummary(file, width, height);
      setStatus("사진 변환이 완료됐어요. 설정을 움직여 원하는 느낌을 찾아보세요.");
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = function () {
      setStatus("이미지를 읽지 못했습니다. 다른 파일을 선택해 주세요.", true);
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  }

  function resetMaker() {
    state.source = createSampleCanvas();
    state.fileName = "pico-dot-sample";
    state.isSample = true;
    elements.fileInput.value = "";
    applySettings(defaultSettings, true);
    setPreviewMode("result");
    renderPixelArt();
    setFileSummary(null);
    setStatus("샘플 이미지가 준비되어 있어요.");
  }

  function downloadImage() {
    if (!elements.canvas || !state.source) {
      setStatus("먼저 사진을 선택해 주세요.", true);
      return;
    }

    var link = document.createElement("a");
    link.download = state.fileName + "-pixel-art.png";
    link.href = elements.canvas.toDataURL("image/png");
    link.click();
    setStatus("PNG 다운로드를 시작했어요.");
  }

  function loadAdSense() {
    var config = window.PICO_DOT_CONFIG;
    var adContainers = document.querySelectorAll("[data-ad-container]");

    adContainers.forEach(function (container) {
      container.hidden = true;
    });

    if (!config || !config.adsenseClient) {
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      encodeURIComponent(config.adsenseClient);
    document.head.appendChild(script);

    document.querySelectorAll("[data-ad-slot]").forEach(function (container) {
      var slotName = container.dataset.adSlot;
      var configKey = slotName.replace(/-([a-z])/g, function (_, letter) {
        return letter.toUpperCase();
      });
      var slotId = config.adSlots && config.adSlots[configKey];

      if (!slotId) {
        return;
      }

      var adContainer = container.closest("[data-ad-container]");
      var ad = document.createElement("ins");
      ad.className = "adsbygoogle";
      ad.style.display = "block";
      ad.dataset.adClient = config.adsenseClient;
      ad.dataset.adSlot = slotId;
      ad.dataset.adFormat = "auto";
      ad.dataset.fullWidthResponsive = "true";

      container.replaceChildren(ad);
      adContainer.hidden = false;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  function bindMakerEvents() {
    if (!elements.fileInput) {
      return;
    }

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

    [elements.pixelSize, elements.colorCount, elements.colorDiversity].forEach(function (control) {
      control.addEventListener("input", function () {
        updateOutputs();
        updatePresetState();
        saveSettings();
        scheduleRender();
      });
    });

    elements.previewButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setPreviewMode(button.dataset.previewMode);
      });
    });

    elements.presetButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyPreset(button);
      });
    });

    elements.download.addEventListener("click", downloadImage);
    elements.reset.addEventListener("click", resetMaker);

    restoreSettings();
    state.source = createSampleCanvas();
    renderPixelArt();
    setFileSummary(null);
    setStatus("샘플 이미지가 준비되어 있어요.");
  }

  setCurrentYear();
  bindMakerEvents();
  loadAdSense();
})();
