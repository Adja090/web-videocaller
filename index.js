var peer;
var myStream;

function ajoutVideo(stream, isLocal = false) {
    try {
        var video = document.createElement('video');
        document.getElementById('participants').appendChild(video);
        video.autoplay = true;
        video.controls = true;
        video.srcObject = stream;
        if (isLocal) video.muted = true; // Empêcher l'écho du son local
    } catch (error) {
        console.error(error);
    }
}

function register() {
    var name = document.getElementById('name').value.trim();

    if (!name) {
        console.error('Nom d\'utilisateur vide');
        return;
    }

    try {
        peer = new Peer(name);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(stream) {
                myStream = stream;
                ajoutVideo(stream, true);
                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                peer.on('call', function(call) {
                    call.answer(myStream);
                    call.on('stream', function(remoteStream) {
                        ajoutVideo(remoteStream);
                    });
                    call.on('error', function(err) {
                        console.error('Erreur d\'appel:', err);
                    });
                });
            })
            .catch(function(err) {
                console.error('Impossible d\'obtenir le flux local', err);
            });

    } catch (error) {
        console.error(error);
    }
}

function appelUser() {
    try {
        var name = document.getElementById('add').value.trim();
        document.getElementById('add').value = "";

        if (!name) {
            console.error('Nom d\'utilisateur vide');
            return;
        }

        var call = peer.call(name, myStream);
        call.on('stream', function(remoteStream) {
            ajoutVideo(remoteStream);
        });
        call.on('error', function(err) {
            console.error('Erreur lors de l\'appel:', err);
        });

    } catch (error) {
        console.error(error);
    }
}

function addScreenShare() {
    var name = document.getElementById('share').value.trim();
    document.getElementById('share').value = "";

    if (!name) {
        console.error('Nom d\'utilisateur vide');
        return;
    }

    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((stream) => {
            let call = peer.call(name, stream);
            call.on('stream', function(remoteStream) {
                ajoutVideo(remoteStream);
            });
            call.on('error', function(err) {
                console.error('Erreur de partage d\'écran:', err);
            });
        })
        .catch((err) => {
            console.error('Échec du partage d\'écran', err);
        });
}