
import React, { useState } from 'react'
import './Hero.css'
import { TailSpin } from 'react-loader-spinner'

const Hero = () => {
    const [link, setLink] = useState('')
    const [loading, setLoading] = useState(false)
    const [videoData, setVideoData] = useState({ data: null, found: false })

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
    const downloadVideo = async () => {
        setLoading(true)
        await fetch('https://vidownlive.com/api/tweet', {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ link: removeParametres(link) })
        }).then(res => res.json()).then(async (obj) => {
            if (obj.found === true) {
                setVideoData({ data: obj.data, found: true })
                setLoading(false)
            } else {
                alert("invalid url")
                setLoading(false)
            }
        })
    }
    const resetSearch = () => {
        setVideoData({ data: null, found: false })
    }

    function download(link) {
        setLoading(true)
        var xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement('a');
            tag.href = imageUrl;
            tag.target = '_blank';
            tag.download = 'sample.mp4';
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        };
        xhr.onerror = err => {
            alert('Failed to download video');
            setLoading(false)
        };
        xhr.send();
        setLoading(false)
    }
    return (
        <>
            <main className={'head'}>
                {videoData.found === false ? (
                    <div className={'inputContainer'}>
                        <input value={link} onChange={(e) => setLink(e.target.value)} className={'input'} type={"text"} placeholder="Paste Tweet link here" />
                        <button onClick={() => downloadVideo()} className={'button'}>{loading ? <RadioLoader /> : 'Download'}</button>
                    </div>
                ) : <div className='outputContainer'>
                    <button className={'button'} onClick={() => resetSearch()} style={{ marginBottom: "20px" }}>Download another video</button>
                    <div className='dimension-container'>{videoData.data.download.map((video, idx) => {
                        return (<button key={idx} className={'button'} onClick={() => download(video.url)}>{loading ? <RadioLoader /> : video.dimension}</button>)
                    })}</div>
                </div>}
            </main>
        </>
    )
}
export default Hero
