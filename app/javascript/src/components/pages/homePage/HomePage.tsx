import React, { useState } from 'react'
import Input from '@src/components/atoms/Input'
import axiosInstance from '@src/axiosInstance';

export default function HomePage() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    await axiosInstance.post('/messages', {
      content: message
    }).then((res) => {
      setMessages([
        ...messages,
        res.data.message
      ])
    })
  }

  return(
    <div>
      <p>
        Message
      </p>
      <br/>
      <p>{messages.map((mess) => (
        <p>{`${mess.sender}: ${mess.content}`}</p>
      ))}</p>
      <Input onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}></Input>
      <button type='submit' onClick={handleSend}>Send</button>
    </div>
  )
}
