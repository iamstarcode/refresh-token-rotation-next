import axios from '../libs/axios'

export const googleAuthFlow = async (profile) => {

  const data = {
    provider: 'google',
    id: profile.sub,
    email: profile.email,
    lastName: profile.family_name,
    firstName: profile.given_name,
  }
  try {
    const response = await axios.post('/auth/sign-in-with-oauth', {
     ...data
    })

    if (response.status == 201) {
      return response.data
    }
  } catch (error) {
    console.log(error.response)
  }
}

export const faceBookAuthFlow = async (profile) => {
  const names = profile.name.split(' ')
  const data = {
    provider: 'facebook',
    id: profile.id,
    email: profile.email,
    lastName: names ? names[0] : '',
    firstName: names ? names[1] : '',
  }
  try {
    const response = await axios.post('/auth/sign-in-with-oauth', {
     ...data
    })

    if (response.status == 201) {
      return response.data
    }
  } catch (error) {
    console.log(error.response)
  }
}
