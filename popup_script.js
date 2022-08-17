const addStreamerBtn = document.querySelector("#addStreamerBtn")
const refreshBtn = document.querySelector("#refreshBtn")
const streamerNameInput = document.querySelector("#inputStreamerName")
const streamersDiv = document.querySelector(".streamers-container")
const output = document.querySelector(".output")
const loginInfo = document.querySelector(".login-info")
const hideBtn = document.querySelector("#hideAddStreamerContainer")
const showBtn = document.querySelector("#showAddStreamerContainer")

const addStreamerContainer = document.querySelector(".add-streamer-container")

let isAddStreamerContainerActive = false

// event listeners

// refreshBtn.addEventListener("click", e => {
//     refresh()
// })
addStreamerBtn.addEventListener("click", (e)=>{
    addStreamer()   
})
hideBtn.addEventListener("click", (e) => {
    addStreamerContainer.style.display = "none"
    isAddStreamerContainerActive = false
    
})
showBtn.addEventListener("click", (e) => {
    addStreamerContainer.style.display = "inline"
    streamerNameInput.focus()   
    isAddStreamerContainerActive = true

})
addStreamerContainer.addEventListener("keypress", e => {
    if (e.key === 'Enter' && isAddStreamerContainerActive){
        addStreamer()
    }
})
document.addEventListener("click", e => {
    if(!addStreamerContainer.contains(e.target) && e.target !== showBtn) addStreamerContainer.style.display = "none"  
})


//at the start when user open pop up window
start()


function login(){
    
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({message: "login"}, (res)=>{
            //console.log(res)
            if (res.message === "loginSuccess" || res.message === "already_signed"){
                loginInfo.innerHTML = "Zalogowano"
                resolve()               
            } else {
                reject()
            }              
        })
    })  
}

function delStreamer(streamerLogin) {

    var streamerDiv = document.querySelector("#"+streamerLogin)  
    chrome.runtime.sendMessage({message: "deleteStreamer", streamerLogin: streamerLogin}, (res)=>{
        if ( res.message === "delete_success" ) {
            streamerDiv.remove()
        }
    })
}

function getStreamersFromStorageAndDisplay(){

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({message: "getAllStreamers"}, (res)=>{
            console.log("loading data from storage and displaying it")
                   
            let streamersData = res.data
            if (!streamersData) reject()

            console.log(streamersData)
            streamersDiv.innerHTML = ""
            streamersData.forEach((s) => {
                const newStreamerDiv = document.createElement("div")
                newStreamerDiv.setAttribute("id", s.login)                
                newStreamerDiv.classList.add("streamer")
                if(s.online) {
                    newStreamerDiv.innerHTML = "<img  src='" + s.image+ "'>"
                    newStreamerDiv.innerHTML += 
                    "<div id='name" + s.login + "'>" + 
                        "<div class='streamer-display-name'>" + s.display_name + "</div>" +  
                        "<div class='streamer-stream-category'>" + s.stream_data.game_name + "</div>" +
                        "<div class='streamer-live-icon-container'><div class='streamer-live-dot'></div>LIVE</div>"+
                        "<div class='streamer-viewer-count'>" + s.stream_data.viewer_count + "</div>" +
                        "</div>"    
                    newStreamerDiv.setAttribute("title", s.stream_data.title)    
                    newStreamerDiv.classList.add("clickable")  
                    newStreamerDiv.addEventListener("click", (e) => {
                        if (e.target !== newStreamerDiv) return
                        const newUrl = "https://www.twitch.tv/" + s.login
                        chrome.tabs.create({url: newUrl })
                    })                
                } else {
                    newStreamerDiv.innerHTML = "<img  class='img_offline' src='" + s.image+ "'>"
                    newStreamerDiv.innerHTML += 
                    "<div id='name" + s.login + "'>" + 
                        "<div class='streamer-display-name display-name-offline'>" + s.display_name + "</div>" +  
                        "<div class='offline-text-container'>Offline</div>" +                          
                        "</div>"                   
                }                   
                let delBtn = document.createElement("div")
                delBtn.innerHTML = "<img src='./images/trash-2.png'>"
                delBtn.classList.add("delete-streamer")
                delBtn.addEventListener("click", (e)=>{
                    delStreamer(s.login)
                })
                newStreamerDiv.appendChild(delBtn)
                streamersDiv.appendChild(newStreamerDiv)
            })
            resolve()
            
            // else {} show some instruction while no streamers are added
        })         
    }) 
}

function refresh() {
    chrome.runtime.sendMessage({message: "refresh"}, (res)=>{
        if (res.message === "refreshSuccess") {
            getStreamersFromStorageAndDisplay()
        }
    })
}
function addStreamer() {
    var userInput = streamerNameInput.value
    if (userInput === "") return

    chrome.runtime.sendMessage({message: "addStreamer", streamer: userInput}, (res)=>{

        if(res.message === "success") refresh()
        else output.innerHTML = "error"
                
    })
    streamerNameInput.value = ""
    streamerNameInput.focus()
}

async function start() {

    await login()
    await getStreamersFromStorageAndDisplay()

    setInterval(() => {
        console.log("auto refresh")
        getStreamersFromStorageAndDisplay()
    }, 30000)

}