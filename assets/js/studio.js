(function () {
  "use strict";

  var canvas = document.querySelector("[data-studio-canvas]");

  if (!canvas) {
    return;
  }

  var context = canvas.getContext("2d");
  var controls = document.querySelectorAll("[data-studio-setting]");
  var colors = document.querySelectorAll("[data-studio-color]");
  var nameInput = document.querySelector("[data-studio-name]");
  var randomButton = document.querySelector("[data-studio-random]");
  var resetButton = document.querySelector("[data-studio-reset]");
  var downloadButton = document.querySelector("[data-studio-download]");
  var status = document.querySelector("[data-studio-status]");
  var storageKey = "picodot-studio-settings-v1";
  var workCanvas = document.createElement("canvas");
  var work = workCanvas.getContext("2d");
  var defaultSettings = {
    face: "round",
    ears: "triangle",
    eyes: "square",
    mouth: "tiny",
    pattern: "stripes",
    accessory: "none",
    fur: "#d99a68",
    patternColor: "#f3c184",
    eyeColor: "#c7ff48",
    accent: "#ff775f",
    background: "#ffe2a8",
    name: "MY PICO CAT"
  };
  var colorChoices = {
    fur: ["#d99a68", "#f5efe1", "#45433f", "#8f7465", "#d8a05d", "#9c9c98"],
    patternColor: ["#f3c184", "#fff4d7", "#25251f", "#e6a277", "#77736b", "#ffffff"],
    eyeColor: ["#c7ff48", "#74c0fc", "#ffd166", "#76d7a0", "#ff9b85"],
    accent: ["#ff775f", "#c7ff48", "#74c0fc", "#ffd166", "#d8b4fe"],
    background: ["#ffe2a8", "#cdeeff", "#f6d6ff", "#dff7c4", "#ffd9d2", "#f7f4ea"]
  };
  var optionValues = {
    face: ["round", "square", "oval"],
    ears: ["triangle", "round", "folded"],
    eyes: ["square", "sleepy", "sparkle"],
    mouth: ["tiny", "smile", "tongue"],
    pattern: ["stripes", "spots", "split", "none"],
    accessory: ["none", "bow", "glasses", "crown"]
  };

  workCanvas.width = 300;
  workCanvas.height = 300;

  function setStatus(message) {
    status.textContent = message;
  }

  function getSettings() {
    var settings = {};

    controls.forEach(function (control) {
      settings[control.dataset.studioSetting] = control.value;
    });
    colors.forEach(function (control) {
      settings[control.dataset.studioColor] = control.value;
    });
    settings.name = nameInput.value.trim() || defaultSettings.name;

    return settings;
  }

  function applySettings(settings) {
    controls.forEach(function (control) {
      var key = control.dataset.studioSetting;
      control.value = settings[key] || defaultSettings[key];
    });
    colors.forEach(function (control) {
      var key = control.dataset.studioColor;
      control.value = settings[key] || defaultSettings[key];
    });
    nameInput.value = settings.name || defaultSettings.name;
  }

  function saveSettings() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(getSettings()));
    } catch (error) {
      // The studio remains usable when storage is unavailable.
    }
  }

  function restoreSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      applySettings(saved && typeof saved === "object" ? saved : defaultSettings);
    } catch (error) {
      applySettings(defaultSettings);
    }
  }

  function pixelRect(x, y, width, height, color) {
    work.fillStyle = color;
    work.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }

  function drawBackground(settings) {
    work.fillStyle = settings.background;
    work.fillRect(0, 0, 300, 300);

    work.strokeStyle = "rgba(37, 37, 31, 0.10)";
    work.lineWidth = 0.6;
    for (var line = 0; line <= 300; line += 12) {
      work.beginPath();
      work.moveTo(line, 0);
      work.lineTo(line, 300);
      work.stroke();
      work.beginPath();
      work.moveTo(0, line);
      work.lineTo(300, line);
      work.stroke();
    }

    pixelRect(24, 55, 5, 19, settings.accent);
    pixelRect(17, 62, 19, 5, settings.accent);
    pixelRect(267, 78, 6, 22, "#25251f");
    pixelRect(259, 86, 22, 6, "#25251f");
    pixelRect(32, 228, 12, 12, "#74c0fc");
  }

  function getFaceBox(face) {
    if (face === "square") {
      return { x: 72, y: 76, width: 156, height: 158, radius: 18 };
    }
    if (face === "oval") {
      return { x: 86, y: 58, width: 128, height: 184, radius: 62 };
    }
    return { x: 68, y: 70, width: 164, height: 164, radius: 78 };
  }

  function facePath(box) {
    work.beginPath();
    work.roundRect(box.x, box.y, box.width, box.height, box.radius);
  }

  function drawEars(settings, box) {
    work.fillStyle = settings.accent;
    work.strokeStyle = "#25251f";
    work.lineWidth = 4;

    if (settings.ears === "round") {
      [box.x + 31, box.x + box.width - 31].forEach(function (centerX) {
        work.beginPath();
        work.arc(centerX, box.y + 12, 29, 0, Math.PI * 2);
        work.fill();
        work.stroke();
      });
      return;
    }

    if (settings.ears === "folded") {
      work.beginPath();
      work.moveTo(box.x + 8, box.y + 31);
      work.lineTo(box.x + 20, box.y - 26);
      work.lineTo(box.x + 63, box.y + 24);
      work.closePath();
      work.moveTo(box.x + box.width - 8, box.y + 31);
      work.lineTo(box.x + box.width - 20, box.y - 26);
      work.lineTo(box.x + box.width - 63, box.y + 24);
      work.closePath();
      work.fill();
      work.stroke();
      pixelRect(box.x + 17, box.y + 1, 32, 8, settings.fur);
      pixelRect(box.x + box.width - 49, box.y + 1, 32, 8, settings.fur);
      return;
    }

    work.beginPath();
    work.moveTo(box.x - 2, box.y + 37);
    work.lineTo(box.x + 23, box.y - 42);
    work.lineTo(box.x + 65, box.y + 27);
    work.closePath();
    work.moveTo(box.x + box.width + 2, box.y + 37);
    work.lineTo(box.x + box.width - 23, box.y - 42);
    work.lineTo(box.x + box.width - 65, box.y + 27);
    work.closePath();
    work.fill();
    work.stroke();
  }

  function drawPattern(settings, box) {
    work.save();
    facePath(box);
    work.clip();
    work.fillStyle = settings.patternColor;

    if (settings.pattern === "stripes") {
      work.lineWidth = 14;
      work.strokeStyle = settings.patternColor;
      for (var offset = -110; offset < 210; offset += 36) {
        work.beginPath();
        work.moveTo(box.x + offset, box.y + box.height);
        work.lineTo(box.x + offset + 170, box.y);
        work.stroke();
      }
    } else if (settings.pattern === "spots") {
      [[38, 42, 17], [110, 28, 13], [132, 92, 19], [48, 119, 14], [93, 142, 11]]
        .forEach(function (spot) {
          work.beginPath();
          work.arc(box.x + spot[0], box.y + spot[1], spot[2], 0, Math.PI * 2);
          work.fill();
        });
    } else if (settings.pattern === "split") {
      work.fillRect(box.x + box.width / 2, box.y, box.width / 2, box.height);
      pixelRect(box.x + box.width / 2 - 5, box.y, 10, box.height, "rgba(255,255,255,0.22)");
    }

    work.restore();
  }

  function drawEyes(settings, box) {
    var eyeY = box.y + box.height * 0.48;
    var leftX = box.x + box.width * 0.31;
    var rightX = box.x + box.width * 0.69;

    work.strokeStyle = "#25251f";
    work.fillStyle = settings.eyeColor;
    work.lineWidth = 5;

    if (settings.eyes === "sleepy") {
      work.beginPath();
      work.moveTo(leftX - 18, eyeY);
      work.quadraticCurveTo(leftX, eyeY + 13, leftX + 18, eyeY);
      work.moveTo(rightX - 18, eyeY);
      work.quadraticCurveTo(rightX, eyeY + 13, rightX + 18, eyeY);
      work.stroke();
      return;
    }

    if (settings.eyes === "sparkle") {
      [leftX, rightX].forEach(function (x) {
        pixelRect(x - 14, eyeY - 14, 28, 28, "#25251f");
        pixelRect(x - 8, eyeY - 8, 16, 16, settings.eyeColor);
        pixelRect(x - 5, eyeY - 7, 6, 6, "#ffffff");
      });
      return;
    }

    [leftX, rightX].forEach(function (x) {
      pixelRect(x - 16, eyeY - 15, 32, 30, "#25251f");
      pixelRect(x - 10, eyeY - 9, 20, 18, settings.eyeColor);
      pixelRect(x + 3, eyeY - 8, 5, 17, "#25251f");
    });
  }

  function drawMouth(settings, box) {
    var centerX = box.x + box.width / 2;
    var noseY = box.y + box.height * 0.66;
    pixelRect(centerX - 8, noseY - 5, 16, 10, settings.accent);

    work.strokeStyle = "#25251f";
    work.lineWidth = 4;
    work.beginPath();
    if (settings.mouth === "smile") {
      work.moveTo(centerX, noseY + 5);
      work.quadraticCurveTo(centerX - 15, noseY + 25, centerX - 31, noseY + 10);
      work.moveTo(centerX, noseY + 5);
      work.quadraticCurveTo(centerX + 15, noseY + 25, centerX + 31, noseY + 10);
    } else if (settings.mouth === "tongue") {
      work.moveTo(centerX - 18, noseY + 9);
      work.lineTo(centerX + 18, noseY + 9);
      work.stroke();
      pixelRect(centerX - 9, noseY + 10, 18, 18, "#ff9bae");
      pixelRect(centerX - 1, noseY + 16, 2, 12, "#d95778");
      return;
    } else {
      work.moveTo(centerX, noseY + 5);
      work.lineTo(centerX, noseY + 18);
      work.moveTo(centerX, noseY + 16);
      work.lineTo(centerX - 11, noseY + 22);
      work.moveTo(centerX, noseY + 16);
      work.lineTo(centerX + 11, noseY + 22);
    }
    work.stroke();
  }

  function drawAccessory(settings, box) {
    var centerX = box.x + box.width / 2;

    if (settings.accessory === "bow") {
      pixelRect(centerX - 39, box.y + box.height - 4, 30, 24, settings.accent);
      pixelRect(centerX + 9, box.y + box.height - 4, 30, 24, settings.accent);
      pixelRect(centerX - 11, box.y + box.height + 1, 22, 16, "#25251f");
    } else if (settings.accessory === "glasses") {
      work.strokeStyle = "#25251f";
      work.lineWidth = 5;
      work.strokeRect(box.x + 24, box.y + 63, 52, 42);
      work.strokeRect(box.x + box.width - 76, box.y + 63, 52, 42);
      pixelRect(centerX - 14, box.y + 80, 28, 5, "#25251f");
    } else if (settings.accessory === "crown") {
      work.fillStyle = "#ffd166";
      work.strokeStyle = "#25251f";
      work.lineWidth = 4;
      work.beginPath();
      work.moveTo(centerX - 44, box.y - 22);
      work.lineTo(centerX - 34, box.y - 62);
      work.lineTo(centerX - 10, box.y - 37);
      work.lineTo(centerX, box.y - 70);
      work.lineTo(centerX + 13, box.y - 37);
      work.lineTo(centerX + 38, box.y - 62);
      work.lineTo(centerX + 44, box.y - 22);
      work.closePath();
      work.fill();
      work.stroke();
    }
  }

  function drawName(settings) {
    var name = settings.name.slice(0, 16).toUpperCase();
    work.font = "700 10px monospace";
    var width = Math.min(174, Math.max(82, work.measureText(name).width + 24));
    var x = (300 - width) / 2;
    pixelRect(x + 4, 266, width, 24, "#25251f");
    pixelRect(x, 262, width, 24, "#fffdf7");
    work.strokeStyle = "#25251f";
    work.lineWidth = 2;
    work.strokeRect(x, 262, width, 24);
    work.fillStyle = "#25251f";
    work.textAlign = "center";
    work.textBaseline = "middle";
    work.fillText(name, 150, 274);
  }

  function render() {
    var settings = getSettings();
    var box = getFaceBox(settings.face);

    work.imageSmoothingEnabled = false;
    work.clearRect(0, 0, 300, 300);
    drawBackground(settings);
    drawEars(settings, box);

    work.fillStyle = settings.fur;
    work.strokeStyle = "#25251f";
    work.lineWidth = 5;
    facePath(box);
    work.fill();
    work.stroke();

    drawPattern(settings, box);
    facePath(box);
    work.stroke();
    drawEyes(settings, box);
    drawMouth(settings, box);
    drawAccessory(settings, box);
    drawName(settings);

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(workCanvas, 0, 0, canvas.width, canvas.height);
    canvas.dataset.renderSignature = [
      settings.face,
      settings.ears,
      settings.eyes,
      settings.mouth,
      settings.pattern,
      settings.accessory,
      settings.fur,
      settings.patternColor,
      settings.eyeColor,
      settings.accent,
      settings.background,
      settings.name
    ].join("|");
    saveSettings();
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomize() {
    var settings = {};

    Object.keys(optionValues).forEach(function (key) {
      settings[key] = randomItem(optionValues[key]);
    });
    Object.keys(colorChoices).forEach(function (key) {
      settings[key] = randomItem(colorChoices[key]);
    });
    settings.name = randomItem([
      "PICO CAT",
      "DOT FRIEND",
      "NICE KITTY",
      "LUCKY CAT",
      "MY PIXEL"
    ]);
    applySettings(settings);
    render();
    setStatus("새로운 조합을 만들었어요.");
  }

  function reset() {
    applySettings(defaultSettings);
    render();
    setStatus("기본 고양이로 돌아왔어요.");
  }

  function download() {
    var link = document.createElement("a");
    var safeName = (nameInput.value.trim() || "picodot-character")
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-|-$/g, "");
    link.download = (safeName || "picodot-character") + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setStatus("1200 × 1200px PNG 저장을 시작했어요.");
  }

  controls.forEach(function (control) {
    control.addEventListener("change", render);
  });
  colors.forEach(function (control) {
    control.addEventListener("input", render);
  });
  nameInput.addEventListener("input", render);
  randomButton.addEventListener("click", randomize);
  resetButton.addEventListener("click", reset);
  downloadButton.addEventListener("click", download);

  restoreSettings();
  render();
}());
