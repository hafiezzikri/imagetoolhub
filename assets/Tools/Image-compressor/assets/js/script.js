/* ========================================
   IMAGE COMPRESSOR
======================================== */

/* ========================================
   SELECT ELEMENTS
======================================== */

const compressButton = document.getElementById("compressButton");

const formatOptions = document.querySelectorAll('input[name="outputFormat"]');

const imageInput = document.getElementById("imageInput");

const uploadArea = document.getElementById("uploadArea");

const compressorEditor = document.getElementById("compressorEditor");

const originalPreview = document.getElementById("originalPreview");

const compressedPreview = document.getElementById("compressedPreview");

const originalSize = document.getElementById("originalSize");

const compressedSize = document.getElementById("compressedSize");

const qualitySlider = document.getElementById("qualitySlider");

const qualityValue = document.getElementById("qualityValue");

const compressionResult = document.getElementById("compressionResult");

const savedPercentage = document.getElementById("savedPercentage");

const downloadButton = document.getElementById("downloadButton");

const resetButton = document.getElementById("resetButton");

/* ========================================
   VARIABLES
======================================== */

let selectedFile = null;

let compressedBlob = null;

let originalFileName = "image";

/* ========================================
   FILE INPUT
======================================== */

imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  handleImage(file);
});

/* ========================================
   HANDLE IMAGE
======================================== */

function handleImage(file) {
  /* =========================
       CHECK FILE TYPE
    ========================== */

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");

    return;
  }

  /* =========================
       CHECK FILE SIZE
       Maximum 10MB
    ========================== */

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    alert("Image size must be less than 10MB.");

    return;
  }

  /* =========================
       SAVE FILE
    ========================== */

  selectedFile = file;

  /*
        Get filename
        without extension
    */

  originalFileName = file.name.split(".").slice(0, -1).join(".");

  /* =========================
       SHOW ORIGINAL SIZE
    ========================== */

  originalSize.textContent = formatFileSize(file.size);

  /* =========================
       CREATE PREVIEW
    ========================== */

  const reader = new FileReader();

  reader.onload = function (event) {
    originalPreview.src = event.target.result;
  };

  reader.readAsDataURL(file);

  /* =========================
       SHOW EDITOR
    ========================== */

  uploadArea.hidden = true;

  compressorEditor.hidden = false;

  /* =========================
       COMPRESS IMAGE
    ========================== */
}

/* ========================================
   QUALITY SLIDER
======================================== */

qualitySlider.addEventListener("input", function () {
  /*
            Update quality text
        */

  qualityValue.textContent = `${qualitySlider.value}%`;

  /*
            Recompress image
        */

  if (selectedFile) {
    compressImage();
  }
});

/* ========================================
   COMPRESS IMAGE
======================================== */

function compressImage() {
  if (!selectedFile) {
    return;
  }

  /* =========================
       BUTTON LOADING
    ========================== */

  compressButton.classList.add("loading");

  compressButton.disabled = true;

  const icon = compressButton.querySelector("i");

  icon.className = "bx bx-loader-alt";

  /* =========================
       CREATE IMAGE
    ========================== */

  const img = new Image();

  const reader = new FileReader();

  reader.onload = function (event) {
    img.onload = function () {
      /* =========================
                       CREATE CANVAS
                    ========================== */

      const canvas = document.createElement("canvas");

      const ctx = canvas.getContext("2d");

      canvas.width = img.width;

      canvas.height = img.height;

      /*
                        Draw image
                    */

      ctx.drawImage(img, 0, 0, img.width, img.height);

      /* =========================
                       GET SETTINGS
                    ========================== */

      const quality = parseInt(qualitySlider.value) / 100;

      const outputFormat = getSelectedFormat();

      /* =========================
                       COMPRESS
                    ========================== */

      canvas.toBlob(
        function (blob) {
          if (!blob) {
            showError("Unable to compress this image.");

            resetCompressButton();

            return;
          }

          /* =========================
                               SAVE BLOB
                            ========================== */

          compressedBlob = blob;

          /* =========================
                               PREVIEW
                            ========================== */

          const previewURL = URL.createObjectURL(blob);

          compressedPreview.src = previewURL;

          /* =========================
                               FILE SIZE
                            ========================== */

          compressedSize.textContent = formatFileSize(blob.size);

          /* =========================
                               CALCULATE SAVINGS
                            ========================== */

          calculateSavings(
            selectedFile.size,

            blob.size,
          );

          /* =========================
                               ENABLE DOWNLOAD
                            ========================== */

          downloadButton.disabled = false;

          /* =========================
                               RESET BUTTON
                            ========================== */

          resetCompressButton();
        },

        outputFormat,

        quality,
      );
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(selectedFile);
}

/* ========================================
   COMPRESS BUTTON
======================================== */

compressButton.addEventListener(
  "click",

  function () {
    compressImage();
  },
);

/* ========================================
   CALCULATE SAVINGS
======================================== */

function calculateSavings(originalBytes, compressedBytes) {
  /*
        Calculate percentage
    */

  const savings = (1 - compressedBytes / originalBytes) * 100;

  /*
        Make sure value
        is not negative
    */

  const finalSavings = Math.max(0, savings);

  /*
        Show result
    */

  savedPercentage.textContent = `${finalSavings.toFixed(1)}%`;

  /*
        Show result container
    */

  compressionResult.hidden = false;
}

/* ========================================
   DOWNLOAD IMAGE
======================================== */

downloadButton.addEventListener("click", function () {
  if (!compressedBlob) {
    return;
  }

  /*
            Create download URL
        */

  const downloadURL = URL.createObjectURL(compressedBlob);

  /*
            Create temporary link
        */

  const link = document.createElement("a");

  link.href = downloadURL;

  const outputFormat = getSelectedFormat();

  const extension = getFileExtension(outputFormat);

  link.download = `${originalFileName}-compressed.${extension}`;

  /*
            Trigger download
        */

  document.body.appendChild(link);

  link.click();

  /*
            Remove link
        */

  document.body.removeChild(link);

  /*
            Release URL
        */

  URL.revokeObjectURL(downloadURL);
});

/* ========================================
   RESET TOOL
======================================== */

resetButton.addEventListener("click", function () {
  /*
            Reset variables
        */

  selectedFile = null;

  compressedBlob = null;

  /*
            Reset input
        */

  imageInput.value = "";

  /*
            Reset previews
        */

  originalPreview.src = "";

  compressedPreview.src = "";

  /*
            Reset sizes
        */

  originalSize.textContent = "0 KB";

  compressedSize.textContent = "0 KB";

  /*
            Reset quality
        */

  qualitySlider.value = 80;

  qualityValue.textContent = "80%";

  /*
            Hide result
        */

  compressionResult.hidden = true;

  /*
            Disable download
        */

  downloadButton.disabled = true;

  /*
            Show upload area
        */

  uploadArea.hidden = false;

  /*
            Hide editor
        */

  compressorEditor.hidden = true;
});

/* ========================================
   DRAG & DROP
======================================== */

/*
    Prevent default browser behavior
*/

["dragenter", "dragover", "dragleave", "drop"].forEach(function (eventName) {
  uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(event) {
  event.preventDefault();

  event.stopPropagation();
}

/* ========================================
   DRAG OVER
======================================== */

["dragenter", "dragover"].forEach(function (eventName) {
  uploadArea.addEventListener(eventName, function () {
    uploadArea.classList.add("dragover");
  });
});

/* ========================================
   DRAG LEAVE
======================================== */

["dragleave", "drop"].forEach(function (eventName) {
  uploadArea.addEventListener(eventName, function () {
    uploadArea.classList.remove("dragover");
  });
});

/* ========================================
   DROP IMAGE
======================================== */

uploadArea.addEventListener("drop", function (event) {
  const files = event.dataTransfer.files;

  if (files && files.length > 0) {
    handleImage(files[0]);
  }
});

/* ========================================
   FORMAT FILE SIZE
======================================== */

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(2)} ${units[index]}`;
}

/* ========================================
   GET OUTPUT FORMAT
======================================== */

function getSelectedFormat() {
  const selectedFormat = document.querySelector(
    'input[name="outputFormat"]:checked',
  );

  return selectedFormat ? selectedFormat.value : "image/jpeg";
}

/* ========================================
   GET FILE EXTENSION
======================================== */

function getFileExtension(format) {
  if (format === "image/png") {
    return "png";
  }

  if (format === "image/webp") {
    return "webp";
  }

  return "jpg";
}

/* ========================================
   RESET COMPRESS BUTTON
======================================== */

function resetCompressButton() {
  compressButton.classList.remove("loading");

  compressButton.disabled = false;

  const icon = compressButton.querySelector("i");

  icon.className = "bx bx-compress";
}

/* ========================================
   ERROR MESSAGE
======================================== */

function showError(message) {
  alert(message);
}
