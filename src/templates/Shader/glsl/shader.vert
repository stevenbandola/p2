varying vec2 vUv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
void main() {
  vec2 uv = vec2(0.0); // Declare the 'uv' variable
  vUv = uv; // Assign 'uv' to 'vUv'

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
