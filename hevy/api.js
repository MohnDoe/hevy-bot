const axios = require('axios')

const HEVY_URL = 'https://api.hevyapp.com/'

const HevyAPIClient = axios.create({
  baseUrl: 'https://api.hevyapp.com/',
  headers: {
    'x-api-key': 'shelobs_hevy_web',
    'auth-token': '4603470f-b1ce-448c-b607-811a2251c47d',
  },
})

const getUserLatestWorkout = async (username) => {
  const workouts = await getUserWorkouts(username, 1, 1)
  return workouts[0] ?? null
}

const getUserWorkouts = async (username, page = 1, perPage = 50) => {
  const hevyResponse = await HevyAPIClient.get(
    `${HEVY_URL}user_workouts_paged?username=${username}&limit=${perPage}&offset=${
      (page - 1) * perPage
    }`
  )

  return hevyResponse.data?.workouts ?? null
}

const checkIfUserFollowingBot = async (username) => {
  const hevyResponse = await HevyAPIClient.get(`${HEVY_URL}followers/hevybot`)
  console.log(hevyResponse.data)
  return !!hevyResponse.data.find((f) => (f.username = username))
}

const followUser = async (username) => {
  await HevyAPIClient.post(`${HEVY_URL}follow`, {
    username,
  })

  return
}

const unfollowUser = async (username) => {
  await HevyAPIClient.post(`${HEVY_URL}unfollow`, {
    username,
  })

  return
}

module.exports = {
  getUserLatestWorkout,
  followUser,
  unfollowUser,
  checkIfUserFollowingBot,
  getUserWorkouts,
}
