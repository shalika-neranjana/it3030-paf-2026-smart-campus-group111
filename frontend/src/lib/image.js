const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

export const cropImageByPixels = async (imageSource, cropPixels, outputName = 'profile-image') => {
  const source =
    typeof imageSource === 'string' ? imageSource : await readFileAsDataUrl(imageSource)
  const image = await loadImage(source)

  const canvas = document.createElement('canvas')
  canvas.width = cropPixels.width
  canvas.height = cropPixels.height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  )

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))

  return new File([blob], `${outputName}.png`, {
    type: 'image/png',
  })
}
