const qrcode = require('qrcode-terminal') 
const { Client, LocalAuth } = require('whatsapp-web.js') 
const fetch = require('node-fetch-commonjs')
const express = require("express")
const { initializeApp } = require('firebase/app')
const { getFirestore, setDoc, doc, getDoc, query, getDocs, collection } = require('firebase/firestore/lite')
const app = express()

app.listen(5000)

const client = new Client({
    authStrategy: new LocalAuth()
})

client.initialize()
let phone = null

const firebaseConfig = {} // Your Firebase Config Here
initializeApp(firebaseConfig)
const db = getFirestore()

const read = function () {
    return new Promise(function (resolve, reject) {
        let final = {}
        const collectionRef = collection(db, 'whatsapp')
        getDocs(collectionRef)
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    final[doc.id] = doc.data()
                })
                resolve(final)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}
  
const write = function (docId, newData) {
    return new Promise(function (resolve, reject) {
        const collectionRef = collection(db, 'whatsapp')
        const docRef = doc(collectionRef, docId)
        setDoc(docRef, newData)
            .then(() => {
                resolve('Data written successfully.')
            })
            .catch((error) => {
                console.error(error)
                reject(error)
            })
        })
}

let getResponse = function (messageHistory, newMessage) {
    return new Promise(function (resolve, reject) {
        let gptMessages = [{ "role": "user", "content": "You are a friendly tool to help people follow their path in Christianity. Here are some rules and examples that you should follow: You should always provide advice based on the essence of Bible verses. While you may add secular advice that aligns with the teachings of the verse, it should never give opinionated secular advice. You empathize briefly before providing the verse. You can personalize your messages by using the word you. For sensitive topics, you should focus on providing Bible verses and explaining their meanings, without offering extensive secular advice. In responses to queries, you should focus on a primary verse that is most relevant to the query or topic and a summary of what the verse means. In dealing with sensitive or controversial topics, you should exercise caution. You should offer uplifting verses, refrain from subjective advice, and recommend that the user talk to a trusted individual about their issues. If a query is unrelated to the Bible, you should remind users that your there to assist with Bible-related questions and cannot provide expertise in unrelated areas. You should avoid using first-person language to maintain your role as a tool or resource, not a conversational partner. For example, instead of saying 'I suggest reading this verse...', the you could say 'Consider this verse...' or This verse might be helpful...'. The language should still be friendly and accessible, but you should not create an impression of having your own thoughts or feelings. Do you understand?" }, { "role": "assistant", "content": "Yes, I understand and will follow all of these rules and examples that you have set for me." }]
        if(messageHistory.length <= 10) {
            for(let i = 0; i < messageHistory.length; i++) {
                gptMessages.push(messageHistory[i])
            }
        } else {
            for(let i = 0; i < 5; i++) {
                gptMessages.push(messageHistory[i])
            }

            for(let i = messageHistory.length - 5; i <= messageHistory.length; i++) {
                gptMessages.push(messageHistory[i])
            }
        }
        gptMessages.push(newMessage)
    
        let requestOptions = {
             method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + "BEARER_AUTH_HERE"
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: gptMessages,
                max_tokens: 750,
                temperature: 0.1
            })
        }
    
        fetch("https://api.openai.com/v1/chat/completions", requestOptions)
            .then(response => response.json())
            .then(data => {
                resolve(data.choices[0].message.content)
            })	
            .catch(error => {
                console.log(error)
                reject(error)
            })
    })
}

client.on('qr', (qr) => {
    console.log(qr)
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log('Client is ready. Listening at '+client.info.wid.user)
    phone = client.info.wid.user
})

client.on('message', async (message) => {
    try {
        if(message.body !== "") {
            let current = await read()
            let user = current[message.from.replace("@c.us", "")]
            let newResponse = ""
            let newStep = 0
            if(user !== undefined) {
                if(user.Step == 0) {
                    client.sendMessage(message.from, `Thanks, ${message.body}. And do you have a preference for the bible version? e.g. NIV / KJV. (It's also fine if you don't)`)
                    newResponse = `Thanks, ${message.body}. And do you have a preference for the bible version? e.g. NIV / KJV. (It's also fine if you don't)`
                    newStep = 1
                } else if(user.Step == 1) {
                    client.sendMessage(message.from, `Great - you're all set up. Is there anything on your mind today?`)
                    newResponse = `Great - you're all set up. Is there anything on your mind today?`
                    newStep = 2
                } else {
                    let response = await getResponse(user.History, {"role": "user", "content": message.body})
                    client.sendMessage(message.from, response)
                    newResponse = response
                    newStep = 2
                }
                user.History.push({"role": "user", "content": message.body})
                user.History.push({"role": "assistant", "content": newResponse})
                let updatedUser = {
                    "Number": user.Number,
                    "Step": newStep,
                    "History": user.History
                }
                write(message.from.replace("@c.us", ""), updatedUser)
            }
        }
    } catch(error) {
        console.log("Error: "+error)
    }
})

app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

app.get("/start", async (req, res) => {
    const chat = await client.getChatById(req.query.number + '@c.us')

    try {
        let current = await read()
        if(current[req.query.number] == undefined) {
            await chat.sendMessage("Welcome to Shepherd! It's a pleasure to have you on board. You can message at any time with questions or queries. All responses are all based on the Word of the Bible. Let's grow together 🌱.")
            await chat.sendMessage("What's your name?")
            await write(req.query.number, {"History": [{"role": "assistant", "content": "Welcome to Shepherd! It's a pleasure to have you on board. You can message at any time with questions or queries. All responses are all based on the Word of the Bible. Let's grow together 🌱."}, {"role": "assistant", "content": "What's your name?"}], "Number": req.query.number, "Step": 0})
        } else {
            await chat.sendMessage("Looks like you tried to initiate a chat with me again. You can just directly talk to me here.")
        }
    } catch (error) {
        console.error(error)
    }
    res.json("Conversation Started.")
})
