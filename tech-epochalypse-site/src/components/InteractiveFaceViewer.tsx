'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const DEPTH_STEP = 0.2
const DRAG_THRESHOLD = 5

interface FacePiece {
  url: string
  id: string
  layer: number
  position: [number, number]
  scale: number
}

const FACE_PIECES: FacePiece[] = [
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0010_forehead.png',
    id: 'forehead',
    layer: 2,
    position: [0, 2.933],
    scale: 1.15,
  },
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0001_hair.png',
    id: 'hair',
    layer: 4,
    position: [0, 3.85],
    scale: 1.15,
  },
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0002_ear.png',
    id: 'ear',
    layer: 5,
    position: [-3.2, 1.2],
    scale: 1.0,
  },
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0007_Eye-R.png',
    id: 'rightEye',
    layer: 7,
    position: [-1.21, 1.72],
    scale: 1.0,
  },
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0008_mouth.png',
    id: 'mouth',
    layer: 9,
    position: [0, -1.5],
    scale: 1.0,
  },
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0009_Eye-L.png',
    id: 'leftEye',
    layer: 9,
    position: [1.21, 1.72],
    scale: 1.0,
  },
  {
    url: 'https://decentral-eyes.s3.us-west-2.amazonaws.com/tech-epoch/musk/Musk-_0000s_0003_nose-2.png',
    id: 'nose',
    layer: 11,
    position: [0, 0.8],
    scale: 0.93,
  },
]

function getAlphaAtUV(
  texture: THREE.Texture,
  uv: THREE.Vector2
): number {
  const image = texture.image as HTMLImageElement
  if (!image) return 1

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return 1

  ctx.drawImage(image, 0, 0)
  const px = Math.floor(uv.x * image.width)
  const py = Math.floor((1 - uv.y) * image.height)
  const data = ctx.getImageData(px, py, 1, 1).data
  return data[3] / 255
}

export default function InteractiveFaceViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const initScene = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Prevent double init
    if (cleanupRef.current) return

    const scene = new THREE.Scene()
    const rect = container.getBoundingClientRect()

    const camera = new THREE.PerspectiveCamera(
      75,
      rect.width / rect.height,
      0.1,
      1000
    )
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(rect.width, rect.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x1e1e1e, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.sortObjects = true
    container.appendChild(renderer.domElement)

    // Style the canvas
    renderer.domElement.style.cursor = 'grab'

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 3
    controls.maxDistance = 16
    controls.maxPolarAngle = Math.PI / 2

    // Drag state
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const draggableObjects: THREE.Mesh[] = []
    let selectedObject: THREE.Mesh | null = null
    let initialObjectZ = 0
    const offset = new THREE.Vector3()
    let isDragging = false
    const pointerDownPosition = new THREE.Vector2()

    // Load face pieces
    const loader = new THREE.TextureLoader()

    FACE_PIECES.forEach((piece) => {
      loader.load(piece.url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        const imgW = texture.image.width
        const imgH = texture.image.height
        const planeW = imgW * 0.005 * piece.scale
        const planeH = imgH * 0.005 * piece.scale

        const geometry = new THREE.PlaneGeometry(planeW, planeH)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          alphaTest: 0.01,
          depthWrite: false,
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          piece.position[0],
          piece.position[1],
          (piece.layer - 1) * DEPTH_STEP
        )
        mesh.userData.id = piece.id
        mesh.renderOrder = piece.layer

        scene.add(mesh)
        draggableObjects.push(mesh)
      })
    })

    // Pointer events
    function onPointerDown(event: PointerEvent) {
      isDragging = false
      pointerDownPosition.set(event.clientX, event.clientY)

      const canvasRect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1
      mouse.y =
        -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(draggableObjects, true)

      for (const intersect of intersects) {
        const obj = intersect.object as THREE.Mesh
        const mat = obj.material as THREE.MeshBasicMaterial

        if (mat.map && mat.transparent && intersect.uv) {
          const alpha = getAlphaAtUV(mat.map, intersect.uv)
          if (alpha > 0.1) {
            selectedObject = obj
            controls.enabled = false
            initialObjectZ = obj.position.z
            offset.copy(intersect.point).sub(obj.position)
            renderer.domElement.style.cursor = 'grabbing'
            break
          }
        } else {
          selectedObject = obj
          controls.enabled = false
          initialObjectZ = obj.position.z
          offset.copy(intersect.point).sub(obj.position)
          renderer.domElement.style.cursor = 'grabbing'
          break
        }
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (!selectedObject) return

      const curr = new THREE.Vector2(event.clientX, event.clientY)
      if (curr.distanceTo(pointerDownPosition) > DRAG_THRESHOLD) {
        isDragging = true
      }

      const canvasRect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1
      mouse.y =
        -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const plane = new THREE.Plane()
      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()),
        new THREE.Vector3(0, 0, initialObjectZ)
      )

      const intersection = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        selectedObject.position.x = intersection.x - offset.x
        selectedObject.position.y = intersection.y - offset.y
        selectedObject.position.z = initialObjectZ
      }
    }

    function onPointerUp() {
      selectedObject = null
      controls.enabled = true
      renderer.domElement.style.cursor = 'grab'
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width === 0 || height === 0) continue
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
    })
    resizeObserver.observe(container)

    // Animate
    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    cleanupRef.current = () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      cleanupRef.current = null
    }
  }, [])

  useEffect(() => {
    // Use IntersectionObserver to lazy-load when visible
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          initScene()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [initScene])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  )
}
