import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AIChatWidget = () => {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your PingUp AI assistant. Ask me anything, get help polishing a post, or ask about your followers/following stats." }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const { getToken } = useAuth()
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, open])

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        const newMessages = [...messages, { role: 'user', content: text }]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const token = await getToken()
            const { data } = await api.post(
                '/api/ai/chat',
                {
                    message: text,
                    // send recent history (excluding the greeting) for context
                    history: newMessages.slice(1, -1)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                className='fixed bottom-6 right-6 z-120 size-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg flex items-center justify-center text-white active:scale-95 transition cursor-pointer'
            >
                {open ? <X className='w-6 h-6' /> : <Bot className='w-6 h-6' />}
            </button>

            {/* Chat Window */}
            {open && (
                <div className='fixed bottom-24 right-6 z-120 w-80 sm:w-96 h-[28rem] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden'>

                    {/* Header */}
                    <div className='flex items-center gap-2 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white'>
                        <Sparkles className='w-5 h-5' />
                        <p className='font-semibold text-sm'>PingUp AI Assistant</p>
                    </div>

                    {/* Messages */}
                    <div className='flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] text-sm px-3 py-2 rounded-lg whitespace-pre-line ${
                                        m.role === 'user'
                                            ? 'bg-indigo-500 text-white rounded-br-none'
                                            : 'bg-white text-slate-700 shadow rounded-bl-none'
                                    }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className='flex justify-start'>
                                <div className='bg-white text-slate-400 text-sm px-3 py-2 rounded-lg shadow rounded-bl-none'>
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input */}
                    <div className='p-3 border-t border-gray-200 flex items-center gap-2'>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder='Ask me anything...'
                            className='flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-indigo-400'
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 text-white p-2 rounded-full cursor-pointer disabled:opacity-50'
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIChatWidget