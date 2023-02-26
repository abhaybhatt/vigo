
import React, { useState } from 'react'
import YoutubeEmbed from './YoutubeEmbed'
import './Hero.css'
import { TailSpin } from 'react-loader-spinner'

const HeroYT = () => {
    const [link, setLink] = useState('')
    const [id, setId] = useState("")
    const [loading, setLoading] = useState(false)
    const [videoData, setVideoData] = useState({ data: null, found: false, title: "" })
    const [type, setType] = useState()
    const [vonly, setVOnly] = useState([])
    const [aonly, setAOnly] = useState([])
    const [avonly, setAVOnly] = useState([])
    const [videos, setVideos] = useState([])
    const [audios, setAudios] = useState([])


    React.useEffect(() => {
        loadFormats()
    }, [videoData.data])

    const getId = (url) => {
        let videoID = ""
        try {
            videoID = url.split('v=') //rerturns array
            if (videoID.length >= 2) {
                videoID = videoID[1].substring(0, 11)
            } else {
                const arr = url.split('/')
                const idx = arr.lastIndexOf("shorts")
                if (idx === -1) {
                    alert("invalid URL")
                    return
                }
                videoID = arr[idx + 1].substring(0, 11)
            }
            return videoID
        } catch {
            alert("invalid URL")
            return
        }
    }

    const loadFormats = async () => {
        const audioDimesnion = []
        const videoDimension = []
        if (videoData.data !== null && videoData.data.formats.length > 0) {
            const audioVideo = []
            const audioOnly = []
            const videoOnly = []
            videoData.data.formats.forEach((video, idx) => {
                if (video.mimeType.substr(0, 9) === "video/mp4" || video.mimeType.substr(0, 10) === "video/webm") {
                    const hasAudio = video.hasAudio
                    const hasVideo = video.hasVideo
                    const qualityLabel = video.qualityLabel
                    const itag = video.itag
                    if (hasAudio === true && hasVideo === true) {

                        audioVideo.push({ hasAudio, hasVideo, qualityLabel, itag })
                    } else {
                        const vidIdx = videoDimension.indexOf(qualityLabel)
                        if (vidIdx === -1) {
                            videoDimension.push(qualityLabel)
                            videoOnly.push({ hasAudio, hasVideo, qualityLabel, itag })
                        }


                    }

                } else if (video.mimeType.substr(0, 10) === "audio/webm") {
                    const qualityLabel = video.audioQuality
                    let vidIdx = audioDimesnion.indexOf(qualityLabel)
                    if (vidIdx === -1) {
                        const hasAudio = video.hasAudio
                        const hasVideo = video.hasVideo
                        audioDimesnion.push(qualityLabel)
                        const itag = video.itag
                        audioOnly.push({ hasAudio, hasVideo, qualityLabel, itag })
                    }

                }


            })
            setAOnly(audioOnly)
            setAVOnly(audioVideo)
            setVOnly(videoOnly)
        }
    }
    const removeParametres = (dirtyLink) => {
        try {
            const splitArr = dirtyLink.split("?")
            return splitArr[0]
        } catch (err) {
            alert("invalid url")
        }

    }
    const RadioLoader = () => {
        return (
            <TailSpin
                height="20"
                width="20"
                color="#ffffff"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        )
    }
    const downloadVideo = async (type) => {
        setLoading(true)
        setType(type)
        let videoID = getId(link)
        setId(videoID)
        if (videoID === "" || videoID === undefined) {
            setLoading(false)
            return
        }
        await fetch('http://localhost:8000/api/yt', {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ videoID: videoID })
        }).then(res => res.json()).then(async (obj) => {
            if (obj.found === true) {
                setVideoData({ data: obj.data, found: true, title: obj.title })
                setLoading(false)
            } else {
                alert("invalid url")
                setLoading(false)
            }
        })
        setLoading(false)
    }
    const resetSearch = () => {
        setVideoData({ data: null, found: false, title: "" })
        setVideos([])
        setAudios([])
        setType('')
    }

    const downloadYoutubeVideo = async (label, t) => {
        const url = `https://www.youtube.com/watch?v=${getId(link)}`
        window.open(`http://localhost:8000/api/yt-download?url=${url}&label=${label}&title=${videoData.title}&type=${t}`)
    }
    return (
        <>
            <main className={'head'}>
                <div className={'inputContainer'}>
                    <input value={link} onChange={(e) => setLink(e.target.value)} className={'input'} type={"text"} placeholder="Paste Youtube link here" />
                    <button onClick={() => downloadVideo('video')} style={{ backgroundColor: 'red' }} className={'button'}>{loading ? <RadioLoader /> : 'Download'}</button>
                </div>
                {
                    videoData.found === true && (
                        <div className='yt'>
                            <div className='yt-title'>
                                <p>{videoData.title}</p>
                            </div>
                            <YoutubeEmbed embedId={id} />
                        </div>
                    )
                }
                <div className='format-container'>
                    {
                        avonly.map((video, idx) => {
                            return (
                                <div className='format-row'>
                                    <div>Video + Audio</div>
                                    <button style={{ backgroundColor: 'red' }} className='button' onClick={() => downloadYoutubeVideo(video.itag, 'video')}>{video.qualityLabel}</button>
                                </div>
                            )
                        })
                    }
                    {
                        vonly.map((video, idx) => {
                            return (
                                <div className='format-row'>
                                    <div>Video</div>
                                    <button style={{ backgroundColor: 'red' }} className='button' onClick={() => downloadYoutubeVideo(video.itag, 'video')}>{video.qualityLabel}</button>
                                </div>
                            )
                        })
                    }
                    {
                        aonly.map((video, idx) => {
                            return (
                                <div className='format-row'>
                                    <div>Audio</div>
                                    <button style={{ backgroundColor: 'red' }} className='button' onClick={() => downloadYoutubeVideo(video.itag, 'audio')}>{video.qualityLabel}</button>
                                </div>
                            )
                        })
                    }
                </div>

            </main>
        </>
    )
}
export default HeroYT
