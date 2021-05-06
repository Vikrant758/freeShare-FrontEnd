const maxAllowedSize = 100 * 1024 * 1024; //100 mb
const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#inputFile");
const bgProgress = document.querySelector(".bg-progress")

const progressContainer = document.querySelector(".progress-container")
const percent = document.querySelector("#percent")
const progressBar = document.querySelector(".progress-bar")

const sharingContainer = document.querySelector(".sharing-container")
const copyBtn = document.querySelector("#copyBtn")
const fileUrlInput = document.querySelector("#fileUrl")

const emailForm = document.querySelector("#emailForm")  

const toast = document.querySelector(".toast");

const host = "https://freeshare-vp.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    console.log('Drag');
    
    if (!dropZone.classList.add("dragged")) {
        dropZone.classList.add("dragged")
    }
});

dropZone.addEventListener("dragleave", (e)=>{
    dropZone.classList.remove("dragged")

});

dropZone.addEventListener("drop", (e)=> {
    e.preventDefault();
    
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.log(files);
    if (files.length) {  
        fileInput.files = files;
        uploadFile();
    }

});

copyBtn.addEventListener("click", ()=>{
    fileUrlInput.select();
    document.execCommand("copy");
    showToast("Link Copied")
})
fileInput.addEventListener("change", ()=>{
    uploadFile();
})
browseBtn.addEventListener("click", (e) => {
    fileInput.click();
})

const resetFileInput = ()=>{
    fileInput.value = "";

}

const uploadFile = ()=>{
    console.log("file added uploading");

    if(fileInput.files.length > 1){
        resetFileInput();
        showToast("Only Upload 1 file!");
        return;
    }
    
    const file = fileInput.files;   

    if(file.size > maxAllowedSize){
        showToast("Max Allowed Size is 100Mb!");
        resetFileInput();
        return;
    }
    
    const formData = new FormData(); 
    formData.append("myfile", file[0]);
    
    progressContainer.style.display = "block";

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = uploadProgress;

    xhr.upload.onerror = ()=>{
        resetFileInput(); 
        showToast(`Error in upload ${xhr.status}`);
    }

    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == XMLHttpRequest.DONE){
            console.log(xhr.responseText); 
            onUploadSuccess(xhr.responseText);  
        }    
    };


    xhr.open("POST", uploadURL);
    xhr.send(formData);
}

const uploadProgress = (e)=>{
    e.preventDefault();
    const total = Math.round((e.loaded / e.total) * 100);
    // console.log(total);
    bgProgress.style.width = `${total}%`;
    percent.innerText = total;
    progressBar.style.transform = `scaleX(${total/100})`;
    // progressContainer.style.display = "none";
    
}

const onUploadSuccess = (res)=>{
    resetFileInput(); 
    
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";
    progressContainer.style.display = "none";
    
    const {file : url} = JSON.parse(res);
    console.log(url);
    sharingContainer.style.display = "block";
    fileUrlInput.value = url;
    

}

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    const url = fileUrlInput.value;
    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["toEmail"].value, //Input field name "toEmail"    If error Comes it will come from this lines please check
        emialFrom: emailForm.elements["formEmail"].value  //Input field name "formEmail"
    };

    console.table(formData);  //If you want to test un comment this
    emailForm[2].setAttribute("disabled", "true")

    fetch(emailURL, {
        method: "POST", 
        headers : {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(({success})=>{
        // console.log(data);
        if(success){
            showToast("Email Sent")
            sharingContainer.style.display = "none";
        }
    });
});

let toastTimer;
const showToast = (msg)=>{
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)"
    toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%, 60px)"
    }, 2000);
};