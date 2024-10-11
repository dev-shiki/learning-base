import cors from 'cors'
import express, { response } from 'express'
import dotenv from 'dotenv';

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors())

app.post('/', async(req, res) => {
  const { content } = req.body
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
              },
              {
                role: "user",
                content
              }
        ],
        stream: true
    })
  })

if (!response.body) return
                
                const reader = response.body.getReader()
                const decoder = new TextDecoder()

                let isFinished = false
                while (!isFinished) {
                    const {done, value} = await reader.read()
                    isFinished = done

                    const decodedValue = decoder.decode(value)
                    if(!decodedValue) break

                    const messages = decodedValue.split('\n\n')
                    const chunks = messages
                        .filter(msg => msg && msg !== 'data: [DONE]')
                        .map(message => {
                            try {
                                return JSON.parse(message.replace(/^data:/g, '').trim());
                            } catch (error) {
                                console.error('Error parsing JSON:', error, 'Message:', message);
                                return null; 
                            }
                        })
                        .filter(chunk => chunk !== null);
                    
                    for  (const chunk of chunks){
                        const content = chunk.choices?.[0].delta.content
                        if (content){
                            res.write(content)
                        }   
                    }
                    //const json = JSON.parse(decodedValue.replace(/^data:\s/g, ''))
                    //console.log(json)
                }
              res.end()
          
/*
          const json = await response.json()
          res.send({
            message: json.choices?.[0].message
          })*/
        })
app.listen(4000, () => {
  console.log('Server listening on port 4000')
})

export default app;