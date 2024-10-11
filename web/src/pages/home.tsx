import { useState } from "react"

type Messages = {role:'system' | 'user' | 'assistant', content : string}[]
export default function Home(){
    const [messages, setMessages] = useState<Messages>([
        {
            role: "system",
            content: " You are a helpful assistant."
        }
    ])
    return <div>

        <div className="container mx-auto pt-12">

            <div className="prose">
                {messages?.map((message, index) => <p key={index}>
                    <em>{message.role}:</em>{message.content}
                    </p>)}
            </div>

            <form onSubmit={async e => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = Object.fromEntries(formData.entries())

                setMessages((messages: Messages) => [...messages, 
                {
                    role: 'user',
                    ...data as {content : string}
                },
                {
                    role: 'assistant',
                    content: ''
                }
                ])

                const response = await fetch('http://localhost:4000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization' : `Bearer ${import.meta.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        content: data.content,
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

                    setMessages(messages =>[
                        ...messages.slice(0, messages.length - 1),
                        {
                            role : 'assistant',
                            content: `${messages[messages.length - 1].content}${decodedValue}`
                        }
                    ])
                    /* const messages = decodedValue.split('\n\n')
                    const chunks = messages
                        .filter(msg => msg && msg !== 'data: [DONE]')
                        .map(message => {
                            try {
                                return JSON.parse(message.replace(/^data:/g, '').trim());
                            } catch (error) {
                                console.error('Error parsing JSON:', error, 'Message:', message);
                                return null; // Jika terjadi error, kembalikan null
                            }
                        })
                        .filter(chunk => chunk !== null);
                    
                    for  (const chunk of chunks){
                        const content = chunk.choices?.[0].delta.content
                        if (content){
                            setMessages(messages => [
                            ...messages.slice(0,messages.length -1), 
                            
                            {
                            role: 'assistant',
                            content: ` ${messages[messages.length -1].content}${content}`

                            }])
                        }   
                    }*/
                    //const json = JSON.parse(decodedValue.replace(/^data:\s/g, ''))
                    //console.log(json)
                }
                /*console.log(data)
                const json = await response.json()
                setMessages(messages => [...messages,{
                    role: 'assistant',
                    content: json.choices[0].messages.content
                }])
                    */
            }}>
                <div className="form-control">
                    <label>
                        <span className="label-text">Content</span>
                    </label>
                    <textarea required name="content" rows={3} className="textarea textarea-bordered"></textarea>
                </div>
                <div className="form-control mt-4">
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </div>
            </form>    
        </div>
    </div>
}