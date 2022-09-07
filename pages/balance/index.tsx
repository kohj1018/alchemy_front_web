import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useUserHealthDataStore, useUserPillListStore } from '../../stores/store'
import { pillApi } from '../../utils/api'
import { UserIntakeNutrientType } from '../../utils/types'
import { ESSENTIAL_NUTRIENTS_LIST } from '../../utils/constants'
import BalanceSummary from '../../components/common/balance/BalanceSummary'
import IntakeReport from '../../components/common/balance/IntakeReport'
import ContainerWithBottomNav from '../../components/layout/ContainerWithBottomNav'
import Image from 'next/image'
import balanceIcon from '../../public/asset/image/balanceIcon.png'
import balanceIllust from '../../public/asset/image/balanceIllust.png'
import MuiCarousel from '../../components/common/MuiCarousel'
import MainHeader from '../../components/layout/MainHeader'
import { CompareContent } from '../../utils/functions/CompareContent'
import { arrayIsNotEmpty } from '../../utils/functions/arrayIsNotEmpty'
import { getTodayDate } from '../../utils/functions/getTodayDate'
import Link from 'next/link'
import TextField from '@mui/material/TextField'
import { InputAdornment, MenuItem } from '@mui/material'

const Index: NextPage = () => {
  const userTakingPillList = useUserPillListStore(state => state.userTakingPillList)
  // const pillListVersion = useUserPillListStore(state => state.pillListVersion)
  // const addPillListVersion = useUserPillListStore(state => state.addPillListVersion)
  const { age, isMale, setAge, setIsMale } = useUserHealthDataStore()
  const [totalIntakeNutrients, setTotalIntakeNutrients] = useState<UserIntakeNutrientType[]>([])
  const [excessNutrients, setExcessNutrients] = useState<UserIntakeNutrientType[]>([])
  const [properNutrients, setProperNutrients] = useState<UserIntakeNutrientType[]>([])
  const [minimumNutrients, setMinimumNutrients] = useState<UserIntakeNutrientType[]>([])
  const [lackNutrients, setLackNutrients] = useState<UserIntakeNutrientType[]>([])
  const [essentialNutrients, setEssentialNutrients] = useState()
  const [todayDateStr, setTodayDateStr] = useState<string>('')

  // 섭취중인 영양분 데이터 가져오기
  useEffect(() => {
    if (age !== null && isMale !== null) {
      (async () => {
        // 현재 섭취중인 영양분 데이터 불러와 저장하기
        const { data: { data: result } } = await pillApi.getTotalBalance(age, isMale, userTakingPillList.map(x => x.id))
        setTotalIntakeNutrients(result)

        // 초과, 최적, 최소, 부족 영양분 분류하여 저장하기
        const excessNutrientsList: UserIntakeNutrientType[] = []
        const properNutrientsList: UserIntakeNutrientType[] = []
        const minimumNutrientsList: UserIntakeNutrientType[] = []
        const lackNutrientsList: UserIntakeNutrientType[] = []
        for (const nutrient of result) {
          // reqMin, reqAvg, reqLimit 기준과 비교하는 클래스
          // 해당 클래스에 값을 넣고 클래스의 메서드를 사용해서 비교하면 됨.
          const compare = new CompareContent(nutrient.content, nutrient.reqMin, nutrient.reqAvg, nutrient.reqLimit)
          if (compare.compareWithLimit()) {
            excessNutrientsList.push(nutrient)
          } else if (compare.compareWithAvgAndLimit()) {
            properNutrientsList.push(nutrient)
          } else if (compare.compareWithMinAndAvg()) {
            minimumNutrientsList.push(nutrient)
          } else {
            lackNutrientsList.push(nutrient)
          }
        }
        setExcessNutrients(excessNutrientsList)
        setProperNutrients(properNutrientsList)
        setMinimumNutrients(minimumNutrientsList)
        setLackNutrients(lackNutrientsList)
      })()
    }
  }, [userTakingPillList, age, isMale])

  // 날짜 불러오기
  useEffect(() => {
    setTodayDateStr(getTodayDate())
  }, [userTakingPillList, age, isMale])

  //
  useEffect(() => {
    ESSENTIAL_NUTRIENTS_LIST.map((essentialNutrient) => {

    })
  })

  // TODO: 회원가입이 생기기 전까지만 회원 정보를 얻기 위해 임시로 있는 부분
  const [writtenAge, setWrittenAge] = useState<number | null>(null)
  const [writtenIsMale, setWrittenIsMale] = useState<boolean | null>(null)
  const sexList = [
    {
      value: 'true',
      label: '남성'
    },
    {
      value: 'false',
      label: '여성'
    }
  ]
  
  const submitHealthData = () => {
    if (writtenAge !== null && writtenAge > 0 && writtenAge < 100) {
      if (writtenIsMale !== null) {
        setAge(writtenAge)
        setIsMale(writtenIsMale)
        alert('완료되었습니다!')
      } else {
        alert('성별을 선택해주세요')
      }
    } else {
      alert('나이를 정확히 입력해주세요')
    }
  }

  return (
    <ContainerWithBottomNav>
      {/*<BackHeader router={router} name='영양제 분석 리포트' />*/}
      <MainHeader />

      {arrayIsNotEmpty(userTakingPillList) ? (
        // TODO: 회원가입이 생기기 전까지만 회원 정보를 얻기 위해 임시로 있는 부분 (현재 복잡한 이중 삼항연산자 로직은 수정될 예정)
        age === null || isMale === null ? (
          <div className='mt-40 flex flex-col space-y-20 items-center'>
            <TextField
              required
              label='나이'
              type='number'
              variant="standard"
              InputProps={{
                endAdornment: <InputAdornment position='end'>세</InputAdornment>
              }}
              helperText='1~99사이의 숫자만 입력할 수 있습니다'
              onChange={(e) => setWrittenAge(parseInt(e.target.value))}
              value={writtenAge}
            />
            <TextField
              select
              label='성별'
              value={writtenIsMale}
              onChange={(e) => setWrittenIsMale(e.target.value === 'true')}
              className='w-3/5'
            >
              {sexList.map((option) => (
                <MenuItem key={option.label} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <button
              className='w-2/3 bg-primary py-3 rounded-[0.625rem] text-base text-white'
              onClick={submitHealthData}
            >
              완료
            </button>
          </div>
        ) : (
          // 등록된 영양제가 있는 경우 보여지는 화면
          <div className='flex flex-col space-y-4'>
            {/* 머리 부분 */}
            <div className='w-full bg-white px-6 py-4 flex items-center justify-between'>
              <div className='flex flex-col'>
                <p className='text-sm text-gray-500'>{todayDateStr}</p>
                <h1 className='text-lg font-bold text-gray-900'>영양제 분석 리포트 💊</h1>
              </div>
              <div className='relative w-[3.25rem] h-[3.25rem]'>
                <Image
                  src={balanceIcon}
                  className='object-cover'
                  layout='fill'
                />
              </div>
            </div>

            {/* 요약 리포트 부분 */}
            <BalanceSummary intakeSupplementsCnt={arrayIsNotEmpty(userTakingPillList) ? userTakingPillList.length : 0} />

            {/* 배너 부분 */}
            <MuiCarousel whereToUse='balanceBanner' />

            {/* 필수 영양분 리포트 부분 */}
            {arrayIsNotEmpty(totalIntakeNutrients) &&
              <IntakeReport
                intakeNutrientData={totalIntakeNutrients}
                excessNutrients={excessNutrients}
                properNutrients={properNutrients}
                minimumNutrients={minimumNutrients}
                lackNutrients={lackNutrients}
              />
            }
          </div>
        )
      ) : (
        // 등록된 영양제가 없는 경우 보여지는 화면
        <div className='bg-white w-full h-full flex flex-col items-center'>
          <div className='mt-[6.25rem] relative w-[18.75rem] h-[12.5rem]'>
            <Image
              src={balanceIllust}
              className='object-cover'
              layout='fill'
            />
          </div>
          <h1 className='mt-[1.5625rem] text-xl'>영양제 밸런스 분석 시작하기</h1>
          <p className='mt-[1.25rem] text-base'>섭취중인 영양제를 먼저 등록해주세요</p>
          <Link
            href='/search'
          >
            <a className='mt-[2.1875rem] w-11/12 h-10 bg-primary rounded-[0.625rem] text-base text-white flex items-center justify-center'>
              섭취중인 영양제 등록하러 가기
            </a>
          </Link>
        </div>
      )}
    </ContainerWithBottomNav>
  )
}

export default Index

// SSR
// export const getServerSideProps: GetServerSideProps = async () => {
//   const res = await axios.get(requestURLs.fetchTotalBalance + `?age=`)
//   const details = res.data.pill[0]
//
//   return {
//     props: {
//       details,
//     },
//   }
// }