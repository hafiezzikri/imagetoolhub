/* ========================================
   IMAGE RESIZER
   TOOL JAVASCRIPT
======================================== */

/* ========================================
   DOM ELEMENTS
======================================== */

// Upload
const uploadArea = document.getElementById("uploadArea");

const imageInput = document.getElementById("imageInput");

// Editor
const resizerEditor = document.getElementById("resizerEditor");

// Original image
const originalPreview = document.getElementById("originalPreview");

const originalDimensions = document.getElementById("originalDimensions");

const originalSize = document.getElementById("originalSize");

// Resize inputs
const widthInput = document.getElementById("widthInput");

const heightInput = document.getElementById("heightInput");

const aspectRatioToggle = document.getElementById("aspectRatioToggle");

const originalRatio = document.getElementById("originalRatio");

// Result
const resultCard = document.getElementById("resultCard");

const resultPreview = document.getElementById("resultPreview");

const resultDimensions = document.getElementById("resultDimensions");

const resultSize = document.getElementById("resultSize");

// Buttons
const resizeButton = document.getElementById("resizeButton");

const downloadButton = document.getElementById("downloadButton");

const resetButton = document.getElementById("resetButton");

/* ========================================
   VARIABLES
======================================== */

let selectedFile = null;

let originalImage = null;

let resizedBlob = null;

let aspectRatio = 1;

let lastChangedInput = null;

/* ========================================
   MAX FILE SIZE
======================================== */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ========================================
   ALLOWED FILE TYPES
======================================== */

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

/* ========================================
   FILE INPUT
======================================== */

imageInput.addEventListener(
  "change",

  function (event) {
    const file = event.target.files[0];

    if (file) {
      handleImage(file);
    }
  },
);

/* ========================================
   DRAG & DROP
======================================== */

uploadArea.addEventListener(
  "dragover",

  function (event) {
    event.preventDefault();

    uploadArea.classList.add("dragover");
  },
);

uploadArea.addEventListener(
  "dragleave",

  function () {
    uploadArea.classList.remove("dragover");
  },
);

uploadArea.addEventListener(
  "drop",

  function (event) {
    event.preventDefault();

    uploadArea.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file) {
      handleImage(file);
    }
  },
);

/* ========================================
   HANDLE IMAGE
======================================== */

function handleImage(file) {
  /* =========================
       VALIDATE FILE TYPE
    ========================== */

  if (!allowedTypes.includes(file.type)) {
    showError("Please upload a JPG, PNG, or WebP image.");

    return;
  }

  /* =========================
       VALIDATE FILE SIZE
    ========================== */

  if (file.size > MAX_FILE_SIZE) {
    showError("Image size must be less than 10MB.");

    return;
  }

  /* =========================
       SAVE FILE
    ========================== */

  selectedFile = file;

  /* =========================
       CREATE FILE READER
    ========================== */

  const reader = new FileReader();

  reader.onload = function (event) {
    /* =========================
               CREATE IMAGE
            ========================== */

    const img = new Image();

    img.onload = function () {
      /* =========================
                       SAVE ORIGINAL IMAGE
                    ========================== */

      originalImage = img;

      /* =========================
                       CALCULATE ASPECT RATIO
                    ========================== */

      aspectRatio = img.width / img.height;

      /* =========================
                       ORIGINAL PREVIEW
                    ========================== */

      originalPreview.src = event.target.result;

      /* =========================
                       ORIGINAL DIMENSIONS
                    ========================== */

      originalDimensions.textContent = `${img.width} × ${img.height} px`;

      /* =========================
                       ORIGINAL FILE SIZE
                    ========================== */

      originalSize.textContent = formatFileSize(file.size);

      /* =========================
                       SET INPUT VALUES
                    ========================== */

      widthInput.value = img.width;

      heightInput.value = img.height;

      /* =========================
                       DISPLAY RATIO
                    ========================== */

      originalRatio.textContent = formatRatio(img.width, img.height);

      /* =========================
                       SHOW EDITOR
                    ========================== */

      uploadArea.hidden = true;

      resizerEditor.hidden = false;

      /* =========================
                       RESET RESULT
                    ========================== */

      resultCard.hidden = true;

      downloadButton.disabled = true;

      resizedBlob = null;
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

/* ========================================
   WIDTH INPUT
======================================== */

widthInput.addEventListener(
  "input",

  function () {
    if (!aspectRatioToggle.checked) {
      return;
    }

    lastChangedInput = "width";

    const width = parseInt(widthInput.value);

    if (!width || width <= 0) {
      return;
    }

    const newHeight = Math.round(width / aspectRatio);

    heightInput.value = newHeight;
  },
);

/* ========================================
   HEIGHT INPUT
======================================== */

heightInput.addEventListener(
  "input",

  function () {
    if (!aspectRatioToggle.checked) {
      return;
    }

    lastChangedInput = "height";

    const height = parseInt(heightInput.value);

    if (!height || height <= 0) {
      return;
    }

    const newWidth = Math.round(height * aspectRatio);

    widthInput.value = newWidth;
  },
);

/* ========================================
   ASPECT RATIO TOGGLE
======================================== */

aspectRatioToggle.addEventListener(
  "change",

  function () {
    if (!aspectRatioToggle.checked) {
      return;
    }

    const width = parseInt(widthInput.value);

    const height = parseInt(heightInput.value);

    if (!width || !height) {
      return;
    }

    /*
            Recalculate ratio
            based on current dimensions
        */

    aspectRatio = width / height;

    originalRatio.textContent = formatRatio(width, height);
  },
);

/* ========================================
   RESIZE BUTTON
======================================== */

resizeButton.addEventListener(
  "click",

  function () {
    resizeImage();
  },
);

/* ========================================
   RESIZE IMAGE
======================================== */

function resizeImage() {
  /* =========================
       VALIDATE IMAGE
    ========================== */

  if (!originalImage) {
    showError("Please upload an image first.");

    return;
  }

  /* =========================
       GET DIMENSIONS
    ========================== */

  const width = parseInt(widthInput.value);

  const height = parseInt(heightInput.value);

  /* =========================
       VALIDATE DIMENSIONS
    ========================== */

  if (!width || !height || width <= 0 || height <= 0) {
    showError("Please enter valid width and height.");

    return;
  }

  /* =========================
       LOADING STATE
    ========================== */

  setResizeLoading(true);

  /* =========================
       CREATE CANVAS
    ========================== */

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  canvas.width = width;

  canvas.height = height;

  /* =========================
       DRAW IMAGE
    ========================== */

  ctx.drawImage(
    originalImage,

    0,

    0,

    width,

    height,
  );

  /* =========================
       GET ORIGINAL FORMAT
    ========================== */

  const outputType = selectedFile.type || "image/jpeg";

  /* =========================
       CONVERT CANVAS TO BLOB
    ========================== */

  canvas.toBlob(
    function (blob) {
      if (!blob) {
        showError("Unable to resize the image.");

        setResizeLoading(false);

        return;
      }

      /* =========================
               SAVE RESULT
            ========================== */

      resizedBlob = blob;

      /* =========================
               CREATE PREVIEW URL
            ========================== */

      const previewURL = URL.createObjectURL(blob);

      resultPreview.src = previewURL;

      /* =========================
               RESULT DIMENSIONS
            ========================== */

      resultDimensions.textContent = `${width} × ${height} px`;

      /* =========================
               RESULT FILE SIZE
            ========================== */

      resultSize.textContent = formatFileSize(blob.size);

      /* =========================
               SHOW RESULT
            ========================== */

      resultCard.hidden = false;

      /* =========================
               ENABLE DOWNLOAD
            ========================== */

      downloadButton.disabled = false;

      /* =========================
               REMOVE LOADING
            ========================== */

      setResizeLoading(false);

      /* =========================
               SCROLL TO RESULT
            ========================== */

      resultCard.scrollIntoView({
        behavior: "smooth",

        block: "center",
      });
    },

    outputType,

    0.92,
  );
}

/* ========================================
   DOWNLOAD BUTTON
======================================== */

downloadButton.addEventListener(
  "click",

  function () {
    if (!resizedBlob) {
      return;
    }

    /* =========================
           CREATE DOWNLOAD URL
        ========================== */

    const downloadURL = URL.createObjectURL(resizedBlob);

    /* =========================
           CREATE LINK
        ========================== */

    const link = document.createElement("a");

    link.href = downloadURL;

    /* =========================
           GET FILE EXTENSION
        ========================== */

    const extension = getFileExtension(selectedFile.type);

    /* =========================
           GET ORIGINAL FILE NAME
        ========================== */

    const originalFileName = selectedFile.name.replace(/\.[^/.]+$/, "");

    /* =========================
           DOWNLOAD NAME
        ========================== */

    link.download = `${originalFileName}-resized.${extension}`;

    /* =========================
           TRIGGER DOWNLOAD
        ========================== */

    document.body.appendChild(link);

    link.click();

    /* =========================
           CLEAN UP
        ========================== */

    document.body.removeChild(link);

    URL.revokeObjectURL(downloadURL);
  },
);

/* ========================================
   RESET BUTTON
======================================== */

resetButton.addEventListener(
  "click",

  function () {
    resetTool();
  },
);

/* ========================================
   RESET TOOL
======================================== */

function resetTool() {
  /* =========================
       RESET VARIABLES
    ========================== */

  selectedFile = null;

  originalImage = null;

  resizedBlob = null;

  aspectRatio = 1;

  /* =========================
       RESET INPUT
    ========================== */

  imageInput.value = "";

  widthInput.value = "";

  heightInput.value = "";

  /* =========================
       RESET PREVIEW
    ========================== */

  originalPreview.src = "";

  resultPreview.src = "";

  /* =========================
       RESET TEXT
    ========================== */

  originalDimensions.textContent = "0 × 0 px";

  originalSize.textContent = "0 KB";

  resultDimensions.textContent = "0 × 0 px";

  resultSize.textContent = "0 KB";

  originalRatio.textContent = "16:9";

  /* =========================
       RESET ASPECT RATIO
    ========================== */

  aspectRatioToggle.checked = true;

  /* =========================
       RESET UI
    ========================== */

  uploadArea.hidden = false;

  resizerEditor.hidden = true;

  resultCard.hidden = true;

  /* =========================
       DISABLE DOWNLOAD
    ========================== */

  downloadButton.disabled = true;

  /* =========================
       REMOVE LOADING
    ========================== */

  setResizeLoading(false);
}

/* ========================================
   FORMAT FILE SIZE
======================================== */

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + units[i];
}

/* ========================================
   FORMAT RATIO
======================================== */

function formatRatio(width, height) {
  const gcdValue = calculateGCD(width, height);

  const ratioWidth = width / gcdValue;

  const ratioHeight = height / gcdValue;

  return `${ratioWidth}:${ratioHeight}`;
}

/* ========================================
   CALCULATE GCD
======================================== */

function calculateGCD(a, b) {
  while (b !== 0) {
    const temp = b;

    b = a % b;

    a = temp;
  }

  return a;
}

/* ========================================
   GET FILE EXTENSION
======================================== */

function getFileExtension(mimeType) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

/* ========================================
   LOADING STATE
======================================== */

function setResizeLoading(isLoading) {
  if (isLoading) {
    resizeButton.disabled = true;

    resizeButton.classList.add("loading");

    resizeButton.innerHTML = `

            <i class="bx bx-loader-alt"></i>

            Resizing...

        `;
  } else {
    resizeButton.disabled = false;

    resizeButton.classList.remove("loading");

    resizeButton.innerHTML = `

            <i class="bx bx-expand"></i>

            Resize Image

        `;
  }
}

/* ========================================
   ERROR MESSAGE
======================================== */

function showError(message) {
  alert(message);
}
