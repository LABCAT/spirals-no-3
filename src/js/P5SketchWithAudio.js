import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import { TetradicColourCalculator } from './functions/ColourCalculators.js';
import Spiral from './classes/Spiral.js';

import audio from "../audio/spirals-no-3.ogg";
import midi from "../audio/spirals-no-3.mid";

/**
 * Blobs No. 2
 */
const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[4].notes; // Sampler 1 - JB4 - Bass SawFilter
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    const noteSet2 = result.tracks[6].notes; // NN19 1 - FARFISAORGAN
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        }

        p.spirals = [];

        p.centreSpirals = [];

        p.colourSet = [];

        p.darkMode = 0;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.darkMode = Math.random() > 0.5 ? 0 : 100;
            p.background(0, 0, p.darkMode);
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying() && p.spirals.length){
                p.strokeWeight(32)
                p.fill(0, 0, p.darkMode, 0.05)
                p.stroke(p.spirals[0].stroke);
                p.rect(0, 0, p.width, p.height);
                if(p.centreSpirals.length) {
                    for (let i = 0; i < p.centreSpirals.length; i++) {
                        const spiral = p.centreSpirals[i];
                        p.translate(spiral.x, spiral.y);
                        spiral.draw();
                        p.translate(-spiral.x, -spiral.y);
                    }  
                }
                for (let i = 0; i < p.spirals.length; i++) {
                    const spiral = p.spirals[i];
                    p.translate(spiral.x, spiral.y);
                    spiral.draw();
                    p.translate(-spiral.x, -spiral.y);
                }    
            }
        }

        p.executeCueSet1 = ({currentCue}) => {
            if((currentCue - 1) % 5 === 0) {
                p.spirals = [];
                p.colourSet = TetradicColourCalculator(
                    p,
                    p.random(0, 360),
                    100,
                    100,
                    0.8
                )
            }

            const colourSetIndex = (currentCue - 1) % 5 < 4 ? (currentCue - 1) % 5 : 0;  

            p.spirals[(currentCue - 1) % 5] =
                new Spiral(
                    p,
                    p.random(0, p.width / 2),
                    p.random(0, p.height / 1.25),
                    p.colourSet[colourSetIndex]
                );
        }

        p.executeCueSet2 = ({currentCue}) => {
            if(!p.spirals.length) {
                return;
            }

            if((currentCue - 1) % 5 === 0) {
                p.centreSpirals = [];
            }

            p.centreSpirals[(currentCue - 1) % 5] =
                new Spiral(
                    p,
                    p.width / 2,
                    p.height / 2,
                    p.random(p.colourSet),
                    false
                );
            p.centreSpirals[(currentCue - 1) % 5].stroke = p.spirals[(currentCue - 1) % 5].stroke;
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
