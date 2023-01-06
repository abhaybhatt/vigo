
import React, { useState } from 'react'
import './Hero.css'
import { TailSpin } from 'react-loader-spinner'

const HeroReddit = () => {
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
        // let redditPostLink = removeParametres(link)
        // if (redditPostLink.charAt(redditPostLink.length - 1)) {
        //     redditPostLink = redditPostLink.substring(0, redditPostLink.length - 1) + '.json'
        // }
        // const data = fetch(`${redditPostLink}.json`, {
        //     headers: {
        //         "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        //     }
        // }).then(res => res.json()).then(d => {
        //     const fetchData = d[0]
        //     const vidUrl = fetchData["data"]['children'][0]['data']['secure_media']['reddit_video']['fallback_url']
        //     const audio_url = "https://v.redd.it/" + vidUrl.split("/")[3] + "/DASH_audio.mp4"
        //     console.info('vidUrl', vidUrl)
        //     console.log('audio_url', audio_url)
        //     download(vidUrl)
        //     // merge(vidUrl, audio_url)
        //     setLoading(false)
        // }).catch(err => {
        //     alert("invalid url")
        //     setLoading(false)
        // })
        await fetch('http://localhost:8000/api/reddit', {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ link: removeParametres(link) })
        }).then(res => res.json()).then(async (obj) => {
            console.info('res', obj)
            if (obj.found === true) {
                setVideoData({ data: obj.data, found: true })
                download(obj.data)
            } else {
                alert("invalid url")
                setLoading(false)
            }
        })
        setLoading(false)
    }
    // function merge(video, audio) {
    //     ffmpeg()
    //         .addInput(video)
    //         .addInput(audio)
    //         .addOptions(['-map 0:v', '-map 1:a', '-c:v copy'])
    //         .format('mp4')
    //         .on('error', error => console.log(error))
    //         .on('end', console.log(' finished !'))
    //         .saveToFile('merged.mp4')
    // }
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
                <div className={'inputContainer'}>
                    <input value={link} onChange={(e) => setLink(e.target.value)} className={'input'} type={"text"} placeholder="Paste Reddit post link here" />
                    <button onClick={() => downloadVideo()} className={'button'}>{loading ? <RadioLoader /> : 'Download'}</button>
                </div>
            </main>
        </>
    )
}
export default HeroReddit
