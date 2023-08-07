    pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js";

    var curScale = 1.0;
    var currentPage = 1;
    var totalPageCount = 0;

    document.querySelector("#pdf-upload").addEventListener("change", function (e) {
        document.querySelector("#pages").innerHTML = "";
        zoomReset();
        var file = e.target.files[0];
        if (file.type !== "application/pdf") {
            alert(file.name + " n'est pas un fichier PDF.");
            return;
        }
        curScale = 1.0;
        currentPage = 1;
        totalPageCount = 0;

        loadPdfFile(file);
        zoomReset();
    });

    function zoomIn() {
    if (curScale < 2.0) {
        curScale += 0.1;
        updateZoom();
    }
    }

    function zoomOut() {
    if (curScale > 0.5) {
        curScale -= 0.1;
        updateZoom();
    }
    }

    function zoomReset() {
    curScale = 1.0;
    updateZoom();
    }

    function updateZoom() {
    document.querySelector("#zoom-percent").innerHTML = Math.round(
        curScale * 100
    );

    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) {
        var canvas = pages[i];
        var context = canvas.getContext("2d");
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(curScale, curScale);
        canvas.style.width = canvas.width / curScale + "px";
        canvas.style.height = canvas.height / curScale + "px";
    }
    }

    function showPage(pageNum) {
    currentPage = pageNum;
    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        page.style.display = i + 1 === pageNum ? "block" : "none";
    }

    var pageIndicator = document.querySelector("#page-indicator");
    pageIndicator.textContent = pageNum + "/" + totalPageCount;

    updatePageButtons();
    }
    function disableButton(buttonId) {
    var button = document.querySelector(buttonId);
    button.disabled = true;
    }

    function enableButton(buttonId) {
    var button = document.querySelector(buttonId);
    button.disabled = false;
    }
    function updatePageButtons() {
    if (currentPage === 1) {
        disableButton("#prev-page");
    } else {
        enableButton("#prev-page");
    }

    if (currentPage === totalPageCount) {
        disableButton("#next-page");
    } else {
        enableButton("#next-page");
    }
    }

    document.querySelector("#zoom-in").onclick = zoomIn;
    document.querySelector("#zoom-out").onclick = zoomOut;
    document.querySelector("#zoom-reset").onclick = zoomReset;
    document.querySelector("#prev-page").onclick = function () {
    if (currentPage > 1) {
        showPage(currentPage - 1);
    }
    };
    document.querySelector("#next-page").onclick = function () {
    if (currentPage < totalPageCount) {
        showPage(currentPage + 1);
    }
    };

    window.onkeypress = function (e) {
    if (e.code === "Equal") {
        zoomIn();
    }
    if (e.code === "Minus") {
        zoomOut();
    }
    };

    function loadPdfFile(file) {
    document.querySelector("#pages").innerHTML = "";
    var fileReader = new FileReader();

    fileReader.onload = function () {
        var typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
        console.log("Le PDF contient", pdf.numPages, "page(s).");
        totalPageCount = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPageCount; pageNum++) {
            pdf.getPage(pageNum).then(function (page) {
            var viewport = page.getViewport({ scale: 1 });
            var scale = 2.0;
            var scaledViewport = page.getViewport({ scale: scale });

            var canvas = document.createElement("canvas");
            canvas.className = "page";
            canvas.title = "Page " + pageNum;
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            if (pageNum !== 1) {
                canvas.style.display = "none";
            }

            document.querySelector("#pages").appendChild(canvas);

            var context = canvas.getContext("2d");
            context.scale(scale, scale);

            page
                .render({
                canvasContext: context,
                viewport: viewport,
                })
                .promise.then(function () {
                console.log("Page rendue en tant qu'image :", pageNum);
                })
                .catch(function (error) {
                console.error("Erreur lors du rendu de la page :", error);
                });
            });
        }

        showPage(1);
        updateZoom();
        updatePageButtons();
        });
    };

    fileReader.readAsArrayBuffer(file);
    }
