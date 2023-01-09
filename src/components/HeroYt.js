
import React, { useState } from 'react'
import './Hero.css'
import { TailSpin } from 'react-loader-spinner'

const HeroYT = () => {
    const [link, setLink] = useState('')
    const [loading, setLoading] = useState(false)
    const [videoData, setVideoData] = useState({ data: null, found: false, title: "" })
    const [type, setType] = useState()
    const [videos, setVideos] = useState([])
    const [audios, setAudios] = useState([])


    React.useEffect(() => {
        loadFormats()
    }, [videoData.data])

    const getId = (url) => {
        let videoID = url.split('v=')[1]
        if (videoID === undefined) {
            const arr = link.split("/")
            const idx = arr.lastIndexOf("shorts")
            if (idx === -1) {
                alert("invalid URL")
                return
            }
            videoID = arr[idx + 1]
        }
        if (videoID === undefined) {
            alert("invalid URL")
            return
        }
        return videoID
    }

    const loadFormats = async () => {
        if (videoData.data !== null && videoData.data.formats.length > 0) {
            if (type === 'video') {
                const data = []
                const dimensions = []

                await videoData.data.formats.forEach((video, idx) => {
                    if (video.mimeType.substr(0, 9) === "video/mp4") {
                        let vidIdx = dimensions.findIndex((dimension) => dimension === video.qualityLabel)
                        if (vidIdx === -1 && video.hasAudio === true) {
                            data.push({
                                url: video.url,
                                dimension: video.qualityLabel,
                                itag: video.itag,
                                audio: video.hasAudio
                            })
                            dimensions.push(video.qualityLabel)
                        } else {
                            if (video.hasAudio === true) {
                                data[vidIdx] = {
                                    url: video.url,
                                    dimension: video.qualityLabel,
                                    itag: video.itag,
                                    audio: video.hasAudio
                                }
                            }
                        }
                    }
                })
                setVideos(data)
            } else if (type === 'audio') {
                const data = []
                const dimensions = []

                await videoData.data.formats.forEach((video, idx) => {
                    if (video.mimeType.substr(0, 10) === "audio/webm") {
                        let vidIdx = dimensions.findIndex((dimension) => dimension === video.audioQuality)
                        if (vidIdx === -1) {
                            data.push({
                                url: video.url,
                                dimension: video.audioQuality,
                                itag: video.itag
                            })
                            dimensions.push(video.audioQuality)
                        } else {
                            if (video.hasAudio === true) {
                                data[vidIdx] = {
                                    url: video.url,
                                    dimension: video.audioQuality,
                                    itag: video.itag
                                }
                            }
                        }
                    }
                })
                setAudios(data)
            }
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
        if (videoID === undefined) return
        await fetch('https://vidownlive.com/api/yt', {
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
    }
    const resetSearch = () => {
        setVideoData({ data: null, found: false, title: "" })
        setVideos([])
        setAudios([])
        setType('')
    }

    const downloadYoutubeVideo = async (label) => {
        const url = `https://www.youtube.com/watch?v=${getId(link)}`
        window.open(`https://vidownlive.com/api/yt-download?url=${url}&label=${label}&title=${videoData.title}&type=${type}`)
    }
    return (
        <>
            <main className={'head'}>
                {videoData.found === false && (
                    <div className={'inputContainer'}>
                        <input value={link} onChange={(e) => setLink(e.target.value)} className={'input'} type={"text"} placeholder="Paste Youtube link here" />
                        <button onClick={() => downloadVideo('video')} className={'button'}>{loading ? <RadioLoader /> : 'Download'}</button>
                        <button style={{ marginTop: '10px' }} onClick={() => downloadVideo('audio')} className={'button'}>{loading ? <RadioLoader /> : 'Download audio'}</button>
                    </div>
                )}
                {videoData.found === true && type === 'video' && (
                    <div className='outputContainer'>
                        <button className={'button'} onClick={() => resetSearch()} style={{ marginBottom: "20px" }}>Download another video</button>
                        <div className='dimension-container'>{videos.map((video, idx) => {
                            return (<button style={{ backgroundColor: video.audio === true ? '#1d9bf0' : '#72bef1' }} key={idx} className={'button'} onClick={() => downloadYoutubeVideo(video.itag)}>{loading ? <RadioLoader /> : video.dimension}</button>)
                        })}</div>
                    </div>)
                }
                {videoData.found === true && type === 'audio' && (
                    <div className='outputContainer' >
                        <button className={'button'} onClick={() => resetSearch()} style={{ marginBottom: "20px" }}>Download another video</button>
                        <div className='dimension-container'>{audios.map((audio, idx) => {
                            return (<button key={idx} className={'button'} onClick={() => downloadYoutubeVideo(audio.itag)}>{loading ? <RadioLoader /> : audio.dimension}</button>)
                        })}</div>
                    </div>)
                }
            </main>
        </>
    )
}
export default HeroYT
