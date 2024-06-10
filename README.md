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
