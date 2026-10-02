/* ========================================
   IMAGE CONVERTER
   TOOL JAVASCRIPT
======================================== */

/* ========================================
   ELEMENTS
======================================== */

const uploadArea = document.getElementById("uploadArea");

const fileInput = document.getElementById("fileInput");

const converterEditor = document.getElementById("converterEditor");

const resultCard = document.getElementById("resultCard");

const previewImage = document.getElementById("previewImage");

const resultImage = document.getElementById("resultImage");

const fileName = document.getElementById("fileName");

const resultFileName = document.getElementById("resultFileName");

const originalSize = document.getElementById("originalSize");

const resultSize = document.getElementById("resultSize");

const formatSelect = document.getElementById("formatSelect");

const qualitySetting = document.getElementById("qualitySetting");

const qualityRange = document.getElementById("qualityRange");

const qualityValue = document.getElementById("qualityValue");

const convertButton = document.getElementById("convertButton");

const resetButton = document.getElementById("resetButton");

const convertAnotherButton = document.getElementById("convertAnotherButton");

const downloadButton = document.getElementById("downloadButton");

/* ========================================
   VARIABLES
======================================== */

let selectedFile = null;

let convertedBlob = null;

let originalFileName = "";

let originalImageURL = "";

let convertedImageURL = "";

/* ========================================
   FORMAT CONFIGURATION
======================================== */

const formatExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/* ========================================
   FILE SIZE FORMATTER
======================================== */

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  const size = bytes / Math.pow(1024, i);

  return parseFloat(size.toFixed(2)) + " " + units[i];
}

/* ========================================
   GET FILE NAME WITHOUT EXTENSION
======================================== */

function getFileNameWithoutExtension(name) {
  return name.replace(/\.[^/.]+$/, "");
}

/* ========================================
   HANDLE FILE
======================================== */

function handleFile(file) {
  if (!file) {
    return;
  }

  /* CHECK IMAGE TYPE */

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");

    return;
  }

  /* CHECK SUPPORTED FORMAT */

  const supportedFormats = ["image/jpeg", "image/png", "image/webp"];

  if (!supportedFormats.includes(file.type)) {
    alert("Supported formats are JPG, PNG, and WEBP.");

    return;
  }

  /* STORE FILE */

  selectedFile = file;

  originalFileName = getFileNameWithoutExtension(file.name);

  /* CREATE IMAGE URL */

  if (originalImageURL) {
    URL.revokeObjectURL(originalImageURL);
  }

  originalImageURL = URL.createObjectURL(file);

  /* SET PREVIEW */

  previewImage.src = originalImageURL;

  /* SET FILE NAME */

  fileName.textContent = file.name;

  /* SET ORIGINAL SIZE */

  originalSize.textContent = formatFileSize(file.size);

  /* SHOW EDITOR */

  converterEditor.hidden = false;

  resultCard.hidden = true;

  /* RESET CONVERTED DATA */

  convertedBlob = null;

  if (convertedImageURL) {
    URL.revokeObjectURL(convertedImageURL);

    convertedImageURL = "";
  }

  /* RESET DOWNLOAD */

  downloadButton.removeAttribute("href");

  /* UPDATE QUALITY */

  updateQualityVisibility();

  /* SCROLL TO EDITOR */

  setTimeout(() => {
    converterEditor.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

/* ========================================
   FILE INPUT
======================================== */

fileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    handleFile(file);
  }
});

/* ========================================
   DRAG & DROP
======================================== */

/* DRAG OVER */

uploadArea.addEventListener("dragover", function (event) {
  event.preventDefault();

  uploadArea.classList.add("dragover");
});

/* DRAG LEAVE */

uploadArea.addEventListener("dragleave", function () {
  uploadArea.classList.remove("dragover");
});

/* DROP */

uploadArea.addEventListener("drop", function (event) {
  event.preventDefault();

  uploadArea.classList.remove("dragover");

  const file = event.dataTransfer.files[0];

  if (file) {
    handleFile(file);
  }
});

/* ========================================
   QUALITY VISIBILITY
======================================== */

function updateQualityVisibility() {
  const selectedFormat = formatSelect.value;

  if (selectedFormat === "image/png") {
    qualitySetting.style.display = "none";
  } else {
    qualitySetting.style.display = "block";
  }
}

/* ========================================
   FORMAT CHANGE
======================================== */

formatSelect.addEventListener("change", function () {
  updateQualityVisibility();
});

/* ========================================
   QUALITY SLIDER
======================================== */

qualityRange.addEventListener("input", function () {
  qualityValue.textContent = this.value + "%";
});

/* ========================================
   CONVERT IMAGE
======================================== */

convertButton.addEventListener("click", function () {
  if (!selectedFile) {
    alert("Please select an image first.");

    return;
  }

  /* DISABLE BUTTON */

  convertButton.disabled = true;

  /* CHANGE BUTTON TEXT */

  const originalButtonHTML = convertButton.innerHTML;

  convertButton.innerHTML = `
      <i class="bx bx-loader-alt bx-spin"></i>
      Converting...
      `;

  /* CREATE IMAGE */

  const image = new Image();

  image.onload = function () {
    /* CREATE CANVAS */

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    /* SET CANVAS SIZE */

    canvas.width = image.naturalWidth;

    canvas.height = image.naturalHeight;

    /* DRAW IMAGE */

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    /* GET FORMAT */

    const selectedFormat = formatSelect.value;

    /* GET QUALITY */

    const quality = parseInt(qualityRange.value, 10) / 100;

    /* CONVERT CANVAS */

    canvas.toBlob(
      function (blob) {
        if (!blob) {
          alert("Failed to convert image.");

          convertButton.disabled = false;

          convertButton.innerHTML = originalButtonHTML;

          return;
        }

        /* STORE BLOB */

        convertedBlob = blob;

        /* CREATE RESULT URL */

        if (convertedImageURL) {
          URL.revokeObjectURL(convertedImageURL);
        }

        convertedImageURL = URL.createObjectURL(blob);

        /* SET RESULT IMAGE */

        resultImage.src = convertedImageURL;

        /* GET EXTENSION */

        const extension = formatExtensions[selectedFormat];

        /* CREATE RESULT FILE NAME */

        const convertedFileName = `${originalFileName}-converted.${extension}`;

        /* SET RESULT FILE NAME */

        resultFileName.textContent = convertedFileName;

        /* SET RESULT SIZE */

        resultSize.textContent = formatFileSize(blob.size);

        /* SET DOWNLOAD */

        downloadButton.href = convertedImageURL;

        downloadButton.download = convertedFileName;

        /* SHOW RESULT */

        resultCard.hidden = false;

        /* RESTORE BUTTON */

        convertButton.disabled = false;

        convertButton.innerHTML = originalButtonHTML;

        /* SCROLL TO RESULT */

        setTimeout(() => {
          resultCard.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      },
      selectedFormat,
      selectedFormat === "image/png" ? undefined : quality,
    );
  };

  /* IMAGE ERROR */

  image.onerror = function () {
    alert("Failed to load image.");

    convertButton.disabled = false;

    convertButton.innerHTML = originalButtonHTML;
  };

  /* LOAD IMAGE */

  image.src = originalImageURL;
});

/* ========================================
   RESET TOOL
======================================== */

function resetTool() {
  /* RESET FILE */

  selectedFile = null;

  /* RESET INPUT */

  fileInput.value = "";

  /* HIDE EDITOR */

  converterEditor.hidden = true;

  /* HIDE RESULT */

  resultCard.hidden = true;

  /* RESET PREVIEW */

  previewImage.src = "";

  resultImage.src = "";

  /* RESET DATA */

  fileName.textContent = "image.jpg";

  resultFileName.textContent = "converted-image.jpg";

  originalSize.textContent = "0 KB";

  resultSize.textContent = "0 KB";

  /* RESET DOWNLOAD */

  downloadButton.removeAttribute("href");

  downloadButton.removeAttribute("download");

  /* RESET VARIABLES */

  convertedBlob = null;

  /* CLEAN OBJECT URL */

  if (originalImageURL) {
    URL.revokeObjectURL(originalImageURL);

    originalImageURL = "";
  }

  if (convertedImageURL) {
    URL.revokeObjectURL(convertedImageURL);

    convertedImageURL = "";
  }

  /* RESET QUALITY */

  qualityRange.value = 90;

  qualityValue.textContent = "90%";

  /* RESET FORMAT */

  formatSelect.value = "image/jpeg";

  /* UPDATE QUALITY */

  updateQualityVisibility();

  /* SCROLL TO UPLOAD */

  uploadArea.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

/* ========================================
   RESET BUTTON
======================================== */

resetButton.addEventListener("click", function () {
  resetTool();
});

/* ========================================
   CONVERT ANOTHER BUTTON
======================================== */

convertAnotherButton.addEventListener("click", function () {
  resetTool();
});

/* ========================================
   INITIALIZE
======================================== */

updateQualityVisibility();
