/**
 * src/services/cloudinary.js
 *
 * Cloudinary Unsigned Image Upload Service
 * Use this to upload player photos and team logos straight from the browser to Cloudinary.
 * Our database will only store the securely generated URL.
 */

// Replace these with your actual Cloudinary details
const CLOUD_NAME = 'djcricketapp'
const UPLOAD_PRESET = 'cricket_unsigned_preset' // Create this in Cloudinary Settings -> Upload

export async function uploadImageToCloudinary(file) {
  if (!file) return null

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Successfully uploaded image:', data.secure_url)

    // Return the URL to save in your Pinia store / Database
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return null
  }
}
