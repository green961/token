// import axios, { AxiosRequestConfig } from 'axios'
// import { useEffect, useState } from 'react'

// async function refreshToken() {
//   const res = await axios.get('http://localhost:3000/user/refresh', {
//     params: {
//       refresh_token: localStorage.getItem('refresh_token'),
//     },
//   })
//   localStorage.setItem('access_token', res.data.access_token || '')
//   localStorage.setItem('refresh_token', res.data.refresh_token || '')
//   return res
// }

// interface PendingTask {
//   config: AxiosRequestConfig
//   resolve: Function
// }

// interface PendingTasc {
//   config: AxiosRequestConfig
//   resolve: string
// }

// let refreshing = false
// let queue: PendingTask[] = []

// axios.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   async (error) => {
//     console.log('errorrrrrrrrrrrrrrrrrrrrrrrr')
//     let { data, config } = error.response

//     if (refreshing) {
//       // console.log('-----------------')
//       return new Promise((resolve) => {
//         queue.push({
//           config,
//           resolve,
//         })
//       })
//     }

//     if (data.statusCode === 401 && !config.url.includes('/user/refresh')) {
//       // console.log('aaaaaaa')
//       refreshing = true
//       const res = await refreshToken()
//       refreshing = false

//       if (res.status === 200) {
//         // console.log('queue', queue.length)
//         queue.forEach(({ config, resolve }) => {
//           resolve(axios(config))
//         })
//         queue = []

//         return axios(config)
//       } else {
//         alert('登录过期，请重新登录')
//         return Promise.reject(res.data)
//       }
//     } else {
//       return error.response
//     }
//   },
// )

// axios.interceptors.request.use(function (config) {
//   const accessToken = localStorage.getItem('access_token')

//   if (accessToken) {
//     config.headers.authorization = 'Bearer ' + accessToken
//   }
//   return config
// })

// function App() {
//   const [aaa, setAaa] = useState()
//   const [bbb, setBbb] = useState()

//   async function login() {
//     const res = await axios.post('http://localhost:3000/user/login', {
//       username: 'guang',
//       password: '123456',
//     })
//     // console.log('set', res.data.access_token)
//     localStorage.setItem('access_token', res.data.access_token)
//     localStorage.setItem('refresh_token', res.data.refresh_token)
//   }

//   async function query() {
//     if (!localStorage.getItem('access_token')) {
//       await login()
//     }

//     console.log('main 1')
//     await Promise.all([
//       axios.get('http://localhost:3000/bbb'),
//       axios.get('http://localhost:3000/bbb'),
//       axios.get('http://localhost:3000/bbb'),
//     ])
//     console.log('main 2')
//     // await new Promise((r) => setTimeout(r, 50))
//     const { data: aaaData } = await axios.get('http://localhost:3000/aaa')
//     const { data: bbbData } = await axios.get('http://localhost:3000/bbb', {})

//     setAaa(aaaData)
//     setBbb(bbbData)

//     setTimeout(async () => {
//       console.log({ refreshing })
//       await Promise.all([axios.get('http://localhost:3000/bbb'), axios.get('http://localhost:3000/bbb')])
//     }, 1000 * 10)
//   }

//   useEffect(() => {
//     query()
//   }, [])

//   return (
//     <div>
//       <p>{aaa}</p>
//       <p>{bbb}</p>
//     </div>
//   )
// }

// export default App
