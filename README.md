# Fourier Transform shenanigans

- Just me messing around with fourier transforms.


[Mathologer](https://www.youtube.com/watch?v=-dhHrg-KbJ0)

 - According to this video, you can refactor e^(pi * i) into (1 + pi/(n * pi)) ^ (n * pi) as n goes to infinity.
 1. The (pi / (n * pi)) is basically 1 / n.
 2. n * pi can be some number m.
 3. so we have (1 + pi / m) ^ m as m goes to infinity; which is something similar to what we have above.
 4. pi is 3.14... but can represent any number x.
 5. so now we have (1 + x / m) ^ m. again something similar to the equations above
 6. plug in pi * i as x as m goes to infinity and the final answer should come really close or approach -1


I didn't know how to use discrete values to get a fourier transform because the fourier transform is only if you
have a waveform function/equation.

So after some googling, I found out about the discrete fourier transform and the discrete-time fourier transform.
 - I don't know how to use DFT's

Okay, onto FFT's.
 - Nevermind. I think I'm going to just get the frequency data from the audio context and then try to operate
   on that. Doing computation with complex numbers in javascript is not it (I'm not feeling it rn).

Discrete vs Continuous is a very important concept to remember in digital signal processing
 - Whole time I was confused on how to apply discrete values to continuous concepts and equations when
   there are other equations that are derived from continuous equations specifically for discrete values

Discrete Fourier Transform:

Great Video by [Simon Xu](https://www.youtube.com/watch?v=mkGsMWi_j4Q) on youtube

Notes:
    - When the wave form function and the analysing function are similar, they'll multiply and sum
    to a large coefficient and if they are disimilar, they'll multiply and sum to a small coefficient
    - a "frequency bin" is just a discrete frequency value after the discrete fourier transform is applied
    - use euler's formula (cos(x) + isin(x)) instead of e^(i * x)
    - the nyquist frequency is also known as the folding frequency
        - get rid of all values above the nyquist limit (sampling frequency / 2)
        - double all values under the nyquist limit
    - the magnitude of the real + imaginery vector after applying DFT corresponds to the amplitude of the sin wave at that frequency bin at that phase (angle of the vector)

Decibel:
    - (because that's what each array value represents for frequency once returned from getFloatFrequencyData()):
    - relative unit of measurement that is 1 tenth of a Bel
    - expresses a ratio between two values
    - equal to 10*log_10(power ratio)

Pulse Code Modulation:
    - Method to digitally represent analog signals
    - values are quantized (processed) to be digital


Web Audio API Notes:
    - audio context has a sampleRate
    - look into how getFloatFrequencyData works and its return format
    - offlineaudiocontext can "render" audio super fast and doesn't need to render it to hardware (" like the speakers ")
    - How do we get audio info for a certain segment of the audio
        - audiobuffers, we can get seconds or duration by dividing length of the audiobuffer by sampleRate
    - getFloatFrequencyData returns data where each value/element is the decibel of amplitude. the amplitude is the y or range and frequency is the x or domain
    - "The frequencies are spread linearly from 0 to 1/2 of the sample rate. For example, for a 48000 Hz sample rate, the last item of the array will represent the decibel value for 24000 Hz."


Current Goals/Todos:
    1. write a wav files with some frequencies removed from some interval/segment of the original audio
    2. in FrequencyPlayer, get sub-segments from AudioBuffers by using utility methods such as copyFromChannel and copyToChannel from the AudioBuffer interface
    3. use sub segments to play or display frequencies in that sub segment of the audio
