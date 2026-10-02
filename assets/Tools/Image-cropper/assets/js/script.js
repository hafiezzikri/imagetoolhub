/* ========================================
   IMAGE CROPPER
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ========================================
       ELEMENTS
    ======================================== */

  const uploadArea = document.getElementById("uploadArea");
  const imageInput = document.getElementById("imageInput");

  const cropperEditor = document.getElementById("cropperEditor");
  const cropperContainer = document.getElementById("cropperContainer");
  const cropperImage = document.getElementById("cropperImage");
  const cropSelection = document.getElementById("cropSelection");

  const originalDimensions = document.getElementById("originalDimensions");

  const aspectRatioSelect = document.getElementById("aspectRatioSelect");

  const cropWidth = document.getElementById("cropWidth");

  const cropHeight = document.getElementById("cropHeight");

  const cropButton = document.getElementById("cropButton");

  const resetButton = document.getElementById("resetButton");

  const resultCard = document.getElementById("resultCard");

  const resultPreview = document.getElementById("resultPreview");

  const resultDimensions = document.getElementById("resultDimensions");

  const cropAgainButton = document.getElementById("cropAgainButton");

  const downloadButton = document.getElementById("downloadButton");

  /* ========================================
       VARIABLES
    ======================================== */

  let originalImage = null;

  let originalWidth = 0;

  let originalHeight = 0;

  let imageScale = 1;

  let cropData = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  let isDragging = false;

  let isResizing = false;

  let resizeHandle = null;

  let startMouseX = 0;

  let startMouseY = 0;

  let startCrop = null;

  let resultDataURL = null;

  /* ========================================
       UPLOAD IMAGE
    ======================================== */

  uploadArea.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    handleImageUpload(file);
  });

  /* ========================================
       DRAG & DROP
    ======================================== */

  uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();

    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();

    uploadArea.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (!file) return;

    handleImageUpload(file);
  });

  /* ========================================
       HANDLE IMAGE UPLOAD
    ======================================== */

  function handleImageUpload(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");

      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      originalImage = new Image();

      originalImage.onload = () => {
        originalWidth = originalImage.naturalWidth;

        originalHeight = originalImage.naturalHeight;

        cropperImage.src = event.target.result;

        originalDimensions.textContent = `${originalWidth} × ${originalHeight} px`;

        uploadArea.hidden = true;

        resultCard.hidden = true;

        cropperEditor.hidden = false;

        cropperImage.onload = () => {
          initializeCrop();
        };
      };

      originalImage.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }

  /* ========================================
       INITIALIZE CROP
    ======================================== */

  function initializeCrop() {
    const imageRect = cropperImage.getBoundingClientRect();

    const containerRect = cropperContainer.getBoundingClientRect();

    imageScale = originalWidth / cropperImage.naturalWidth;

    let cropDisplayWidth = imageRect.width * 0.8;

    let cropDisplayHeight = imageRect.height * 0.8;

    const selectedRatio = getAspectRatio();

    if (selectedRatio) {
      cropDisplayHeight = cropDisplayWidth / selectedRatio;
    }

    if (cropDisplayHeight > imageRect.height * 0.8) {
      cropDisplayHeight = imageRect.height * 0.8;

      if (selectedRatio) {
        cropDisplayWidth = cropDisplayHeight * selectedRatio;
      }
    }

    const x =
      imageRect.left -
      containerRect.left +
      (imageRect.width - cropDisplayWidth) / 2;

    const y =
      imageRect.top -
      containerRect.top +
      (imageRect.height - cropDisplayHeight) / 2;

    cropData = {
      x,

      y,

      width: cropDisplayWidth,

      height: cropDisplayHeight,
    };

    updateCropSelection();

    updateDimensions();
  }

  /* ========================================
       GET ASPECT RATIO
    ======================================== */

  function getAspectRatio() {
    const value = aspectRatioSelect.value;

    if (value === "free") {
      return null;
    }

    const parts = value.split(":");

    return Number(parts[0]) / Number(parts[1]);
  }

  /* ========================================
       UPDATE CROP SELECTION
    ======================================== */

  function updateCropSelection() {
    cropSelection.style.display = "block";

    cropSelection.style.left = `${cropData.x}px`;

    cropSelection.style.top = `${cropData.y}px`;

    cropSelection.style.width = `${cropData.width}px`;

    cropSelection.style.height = `${cropData.height}px`;
  }

  /* ========================================
       UPDATE DIMENSIONS
    ======================================== */

  function updateDimensions() {
    const imageRect = cropperImage.getBoundingClientRect();

    const scaleX = originalWidth / imageRect.width;

    const scaleY = originalHeight / imageRect.height;

    const width = Math.round(cropData.width * scaleX);

    const height = Math.round(cropData.height * scaleY);

    cropWidth.value = width;

    cropHeight.value = height;
  }

  /* ========================================
       CROP SELECTION MOUSE DOWN
    ======================================== */

  cropSelection.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("crop-handle")) {
      isResizing = true;

      resizeHandle = [...event.target.classList].find((className) =>
        className.startsWith("handle-"),
      );
    } else {
      isDragging = true;
    }

    startMouseX = event.clientX;

    startMouseY = event.clientY;

    startCrop = {
      ...cropData,
    };

    event.preventDefault();
  });

  /* ========================================
       MOUSE MOVE
    ======================================== */

  document.addEventListener("mousemove", (event) => {
    if (!isDragging && !isResizing) {
      return;
    }

    const deltaX = event.clientX - startMouseX;

    const deltaY = event.clientY - startMouseY;

    const imageRect = cropperImage.getBoundingClientRect();

    const containerRect = cropperContainer.getBoundingClientRect();

    const imageLeft = imageRect.left - containerRect.left;

    const imageTop = imageRect.top - containerRect.top;

    if (isDragging) {
      let newX = startCrop.x + deltaX;

      let newY = startCrop.y + deltaY;

      newX = Math.max(
        imageLeft,
        Math.min(newX, imageLeft + imageRect.width - cropData.width),
      );

      newY = Math.max(
        imageTop,
        Math.min(newY, imageTop + imageRect.height - cropData.height),
      );

      cropData.x = newX;

      cropData.y = newY;
    }

    if (isResizing) {
      resizeCrop(deltaX, deltaY, imageRect, imageLeft, imageTop);
    }

    updateCropSelection();

    updateDimensions();
  });

  /* ========================================
       RESIZE CROP
    ======================================== */

  function resizeCrop(deltaX, deltaY, imageRect, imageLeft, imageTop) {
    let newX = startCrop.x;

    let newY = startCrop.y;

    let newWidth = startCrop.width;

    let newHeight = startCrop.height;

    const ratio = getAspectRatio();

    if (resizeHandle === "handle-se") {
      newWidth = startCrop.width + deltaX;

      newHeight = ratio ? newWidth / ratio : startCrop.height + deltaY;
    }

    if (resizeHandle === "handle-sw") {
      newWidth = startCrop.width - deltaX;

      newHeight = ratio ? newWidth / ratio : startCrop.height + deltaY;

      newX = startCrop.x + deltaX;
    }

    if (resizeHandle === "handle-ne") {
      newWidth = startCrop.width + deltaX;

      newHeight = ratio ? newWidth / ratio : startCrop.height - deltaY;

      newY = startCrop.y + deltaY;
    }

    if (resizeHandle === "handle-nw") {
      newWidth = startCrop.width - deltaX;

      newHeight = ratio ? newWidth / ratio : startCrop.height - deltaY;

      newX = startCrop.x + deltaX;

      newY = startCrop.y + deltaY;
    }

    const minSize = 30;

    if (newWidth < minSize || newHeight < minSize) {
      return;
    }

    if (newX < imageLeft) {
      return;
    }

    if (newY < imageTop) {
      return;
    }

    if (newX + newWidth > imageLeft + imageRect.width) {
      return;
    }

    if (newY + newHeight > imageTop + imageRect.height) {
      return;
    }

    cropData = {
      x: newX,

      y: newY,

      width: newWidth,

      height: newHeight,
    };
  }

  /* ========================================
       MOUSE UP
    ======================================== */

  document.addEventListener("mouseup", () => {
    isDragging = false;

    isResizing = false;

    resizeHandle = null;
  });

  /* ========================================
       ASPECT RATIO CHANGE
    ======================================== */

  aspectRatioSelect.addEventListener("change", () => {
    const ratio = getAspectRatio();

    if (!ratio) {
      return;
    }

    const currentWidth = cropData.width;

    const newHeight = currentWidth / ratio;

    const imageRect = cropperImage.getBoundingClientRect();

    if (newHeight > imageRect.height) {
      cropData.height = imageRect.height * 0.8;

      cropData.width = cropData.height * ratio;
    } else {
      cropData.height = newHeight;
    }

    updateCropSelection();

    updateDimensions();
  });

  /* ========================================
       MANUAL WIDTH
    ======================================== */

  cropWidth.addEventListener("change", () => {
    const value = Number(cropWidth.value);

    if (!value || value <= 0) {
      return;
    }

    const imageRect = cropperImage.getBoundingClientRect();

    const scale = imageRect.width / originalWidth;

    const newWidth = value * scale;

    cropData.width = Math.min(newWidth, imageRect.width);

    const ratio = getAspectRatio();

    if (ratio) {
      cropData.height = cropData.width / ratio;
    }

    updateCropSelection();

    updateDimensions();
  });

  /* ========================================
       MANUAL HEIGHT
    ======================================== */

  cropHeight.addEventListener("change", () => {
    const value = Number(cropHeight.value);

    if (!value || value <= 0) {
      return;
    }

    const imageRect = cropperImage.getBoundingClientRect();

    const scale = imageRect.height / originalHeight;

    const newHeight = value * scale;

    cropData.height = Math.min(newHeight, imageRect.height);

    const ratio = getAspectRatio();

    if (ratio) {
      cropData.width = cropData.height * ratio;
    }

    updateCropSelection();

    updateDimensions();
  });

  /* ========================================
       CROP IMAGE
    ======================================== */

  cropButton.addEventListener("click", () => {
    if (!originalImage) {
      return;
    }

    const imageRect = cropperImage.getBoundingClientRect();

    const scaleX = originalWidth / imageRect.width;

    const scaleY = originalHeight / imageRect.height;

    const containerRect = cropperContainer.getBoundingClientRect();

    const imageLeft = imageRect.left - containerRect.left;

    const imageTop = imageRect.top - containerRect.top;

    const sourceX = (cropData.x - imageLeft) * scaleX;

    const sourceY = (cropData.y - imageTop) * scaleY;

    const sourceWidth = cropData.width * scaleX;

    const sourceHeight = cropData.height * scaleY;

    const canvas = document.createElement("canvas");

    canvas.width = Math.round(sourceWidth);

    canvas.height = Math.round(sourceHeight);

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      originalImage,

      sourceX,

      sourceY,

      sourceWidth,

      sourceHeight,

      0,

      0,

      canvas.width,

      canvas.height,
    );

    resultDataURL = canvas.toDataURL("image/png");

    resultPreview.src = resultDataURL;

    resultDimensions.textContent = `${canvas.width} × ${canvas.height} px`;

    resultCard.hidden = false;

    downloadButton.disabled = false;

    resultCard.scrollIntoView({
      behavior: "smooth",

      block: "start",
    });
  });

  /* ========================================
       DOWNLOAD IMAGE
    ======================================== */

  downloadButton.addEventListener("click", () => {
    if (!resultDataURL) {
      return;
    }

    const link = document.createElement("a");

    link.href = resultDataURL;

    link.download = "cropped-image.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  });

  /* ========================================
       RESET
    ======================================== */

  resetButton.addEventListener("click", resetTool);

  cropAgainButton.addEventListener("click", () => {
    resultCard.hidden = true;

    cropperEditor.hidden = false;

    resultDataURL = null;
  });

  function resetTool() {
    originalImage = null;

    resultDataURL = null;

    imageInput.value = "";

    cropperImage.src = "";

    cropperEditor.hidden = true;

    resultCard.hidden = true;

    uploadArea.hidden = false;

    cropSelection.style.display = "none";

    cropWidth.value = 0;

    cropHeight.value = 0;
  }
});
