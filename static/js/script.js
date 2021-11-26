let upload_filename = "";

function ElementWithAttList(element_name, list){
    let new_element = document.createElement(element_name);
    const length = list.length;
    for(let i = 0; i < length; i++){
        let attribute = list[i];
        new_element.setAttribute(attribute[0],attribute[1]);
    }
    return new_element;
}

function dragover_handler(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
}

function drop_handler(event) {
    event.preventDefault();
    document.getElementById("message").innerHTML="アップロード中...";

    if (event.dataTransfer.items.length != 1){
        document.getElementById("message").innerHTML = "ファイルを一つだけドロップして下さい";
        return;
    }

    const file = event.dataTransfer.items[0].getAsFile();
    upload_filename = file.name;

    if(file.type != "application/pdf"){
        document.getElementById("message").innerHTML = "PDFをドロップしてください";
        return;
    }
     
    let data = new FormData();
    data.append('file', file);

    fetch('/upload',{method:'POST', body:data})
    .then(
      response => {
          if(response.statusText == 'OK'){
          console.log(response);
          let response_data = response.blob()
          console.log(response_data);
          return response_data;//PDFの1ページ目もしくはエラーメッセージが返ってくる
          }
      }
    ).then(
        blob => {
            console.log(blob);
            //PDFの編集が失敗した場合
            if(blob.type == "text/plain"){
                console.log(blob.stream());
                var reader = new FileReader();
                reader.onload = function(){
                    document.getElementById("message").innerHTML = "";
                    let message1 = document.createElement("p"); let message2 = document.createElement("p");
                    message1.innerHTML = reader.result;
                    message1.setAttribute("class", "lead");
                    message2.innerHTML = "違うファイルをドロップしてください";
                    message2.setAttribute("class", "lead");

                    document.getElementById("message").appendChild(message1);
                    document.getElementById("message").appendChild(message2);
                }
                reader.readAsText(blob);
            }
            
            //PDFの編集が成功した場合
            if(blob.type == "application/pdf"){
                let url_page1 = URL.createObjectURL(blob);
                let EmbedPDF = ElementWithAttList("embed",[
                    ["src", url_page1], ["type", "application/pdf"],["width", "100%"],["height","80%"]
                ]);

                let BackButton = ElementWithAttList("a", [
                    ["class", "btn btn-light"], 
                    ["style", "margin-top:5%;"],
                    ["onclick", "back();"]
                ]);
                let BackButton_image = ElementWithAttList("img", [
                    ["src", "/static/turnback.png"], 
                    ["height", "20"], ["width", "30"]
                ]);
                BackButton.appendChild(BackButton_image);

                let DownloadButton = ElementWithAttList("button", [
                    ["class", "btn btn-outline-secondary btn-sm"], 
                    ["style", "position:absolute; transform:translate(-50%,0%); left:50%; margin-top:5%; "], 
                    ["onclick", "download();"]
                ]);               
                DownloadButton.appendChild(document.createTextNode("小冊子をダウンロード"));

                let form = document.getElementById("upload_form");
                form.innerHTML = "";
                form.appendChild(EmbedPDF);
                form.appendChild(BackButton);
                form.appendChild(DownloadButton);
                console.log("button is created");
            }
        }      
    ).catch(error => {
        document.getElementById("message").innerHTML = "";
        let message1 = document.createElement("p"); let message2 = document.createElement("p");
        message1.innerHTML = "エラー";
        message1.setAttribute("class", "lead");
        message2.innerHTML = "違うファイルをドロップしてください";
        message2.setAttribute("class", "lead");

        document.getElementById("message").appendChild(message1);
        document.getElementById("message").appendChild(message2);   
    });
    
}

function back(){
    refresh_file(upload_filename);
    $("#upload_form").load("/static/initial.html");
}

function download(){
    console.log("start download");

    //"ダウンロード中..."に画面を切り替える
    let messageForm = ElementWithAttList("div", [["class", "messageForm"]]);
    let message = ElementWithAttList("p", [["style", "font-size:30px; font-weight:300"],["id","message"]]);
    message.appendChild(document.createTextNode("ダウンロード中..."));
    messageForm.appendChild(message);
    let form = document.getElementById("upload_form");
    form.innerHTML = "";
    form.appendChild(messageForm);

    //ダウンロードを行う
    let download_form = new FormData();
    download_form.set('filename', upload_filename);

    fetch('/download',{method:'POST', body: download_form})
    .then(
        response => response.blob()
    ).then(
        blob => {
            url = URL.createObjectURL(blob);
            let download_button =  ElementWithAttList("a", [
                ["href", url], 
                ["download", 'booklet_'+ upload_filename]
            ]);
            download_button.click();
            refresh_file(upload_filename);
            //初期画面へ遷移
            document.getElementById("message").innerHTML = "PDFをドラッグ&ドロップ";
        }
    )
    
    
}

function refresh_file(delete_filename){
    let delete_formdata = new FormData();
    delete_formdata.set('filename', delete_filename);

    fetch('/refresh',{method:'POST', body:delete_formdata});
}

$(window).on('beforeunload',function(event){
    event.preventDefault();
    refresh_file(upload_filename);
    return '';
});
