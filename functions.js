document.getElementById('fileButton');
document.getElementById('fileUpload');
fileUpload.addEventListener('click', function(e) {
  e.preventDefault();
  fileButton.click();
});
var config = {
  databaseURL: "https://akalan-db.firebaseio.com",
  storageBucket: "akalan-db.appspot.com"
};
firebase.initializeApp(config);
var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');
fileButton.addEventListener('change', function(e) {
  var file = e.target.files[0];
  var storageRef = firebase.storage().ref(file.name);
  var imageUrl = "<img height='500' src='https://firebasestorage.googleapis.com/v0/b/akalan-db.appspot.com/o/" + file.name + "?alt=media&token=e0a91dd8-1b7f-4574-b042-3780feaa13b5'>";
  var videoUrl = "<video width='325' controls><source src='https://firebasestorage.googleapis.com/v0/b/akalan-db.appspot.com/o/" + file.name + "?alt=media&token=e0a91dd8-1b7f-4574-b042-3780feaa13b5'></video>";
  var audioUrl = "<audio controls><source src='https://firebasestorage.googleapis.com/v0/b/akalan-db.appspot.com/o/" + file.name + "?alt=media&token=e0a91dd8-1b7f-4574-b042-3780feaa13b5'></audio>";
  var undefinedUrl = "<div style='text-align: center; width: 150px; height: 80px;'>Bu dosya türü görüntülenemiyor !<br><a style='color:blue;'href='https://firebasestorage.googleapis.com/v0/b/akalan-db.appspot.com/o/" + file.name + "?alt=media&token=e0a91dd8-1b7f-4574-b042-3780feaa13b5'target='__blank'>İNDİR</a></div>";
  switch(file.type) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/svg+xml":
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
    var mediaUrl = imageUrl;
    break;
    case "video/mp4":
    var mediaUrl = videoUrl;
    break;
    case "audio/mpeg":
    case "audio/mp4":
    case "application/octet-stream":
    var mediaUrl = audioUrl;
    break;
    default:
    var mediaUrl = undefinedUrl;
  }
  var task = storageRef.put(file);
  $("#uploader").show();
  task.on('state_changed', function progress(snapshot) {
    uploader.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    if(uploader.value == 100) {
      $("#uploader").hide();
      $(".alert").show();
      mediaSend();
      uploader.value = 0;
    }
  });
  function mediaSend() {
    var kadi = $("#kadi").val();
    if(kadi != "") {
      var date = new Date();
      var messageKey = firebase.database().ref("messages").push().key;
      firebase.database().ref("guest-web-chat/messages/" + messageKey).set({
        msgKey: messageKey,
        from: kadi,
        message: mediaUrl,
        hour: date.getHours(),
        minute: date.getMinutes()
      });
    }
  }
});
function clean() {
  firebase.database().ref("guest-web-chat/").remove().key;
}
function registerMember() {
  var kadi = $("#kadi").val();
  if(kadi != "") {
    var date = new Date();
    firebase.database().ref("guest-web-chat/users/" + kadi).set({
      username: kadi,
      hour: date.getHours(),
      minute: date.getMinutes()
    });
    $("#loginScreen").hide();
    $("#chatScreen").show();
    bring();
  } else {
    alert("Kullanıcı adını boş bırakmayın !");
  }
}
function sendMessage() {
  var msg = $("#msg").val();
  var kadi = $("#kadi").val();
  if(msg != "") {
    var date = new Date();
    var messageKey = firebase.database().ref("messages").push().key;
    firebase.database().ref("guest-web-chat/messages/" + messageKey).set({
      msgKey: messageKey,
      message: msg,
      from: kadi,
      hour: date.getHours(),
      minute: date.getMinutes()
    });
    $("#msg").val('');
  } else {
    alert("Lütfen boş bırakmayın !");
  }
}
function bring() {
  var ref_messages = firebase.database().ref("guest-web-chat/messages");
  var kadi = $("#kadi").val();
  ref_messages.on('value', function(snapshot) {
    $("#messageArea").html("");
    snapshot.forEach(function(childSnapshot) {
      var data = childSnapshot.val();
      if(data.from == kadi) {
        var msg = `<div class="outgoingMessage"><div style="max-width: 350px;"><b>(` + data.from + `) </b>` + data.message + `<b> (` + data.hour + ` : ` + data.minute + `)</b></div><span style="font-weight: normal; display: flex; align-items: center; margin-left: 5px; color: #fff; font-size: 20px;" onclick="firebase.database().ref('guest-web-chat/messages/` + data.msgKey + `').remove().key;""><i class="fa fa-remove"></i></span>`;
        $("#messageArea").append(msg);
      } else {
        var msg = `<div class="incomingMessage"><div style="max-width: 350px;"><b>(` + data.from + `) </b>` + data.message + `<b> (` + data.hour + ` : ` + data.minute + `)</b></div></div>`;
        $("#messageArea").append(msg);
      }
      $(".card-body").scrollTop($('.card-body')[0].scrollHeight - $('.card-body')[0].clientHeight);
    });
  });
  var ref_users = firebase.database().ref("guest-web-chat/users");
  ref_users.on('value', function(snapshot) {
   $("#modal-history").html("");
   snapshot.forEach(function(childSnapshot) {
    var data = childSnapshot.val(); {
      var msg = '<hr><div>' + data.username + '<div style="float: right;">(' + data.hour + ':' + data.minute + ')</div></div>';
      $("#modal-history").append(msg);
    }
  });
 });
}