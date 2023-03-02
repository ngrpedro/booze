import Head from 'next/head'
import React, { ReactElement } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { prisma } from './../../lib/prisma'
import { authOptions } from './../api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import { priceFormatter } from '@/utils/formatter'
import Layout from '@/components/layout'

interface OrdersDetails {
  orders: {
    id: string
    payment_mode: string
    price_amount: number
    userId: string
    createdAt: string
  }[]
  productsOnOrder: {
    productId: string
    orderId: string
  }[]
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  })

  const ordersArray = await prisma.order.findMany({
    where: {
      userId: user?.id,
    },
  })
  const orders = JSON.parse(JSON.stringify(ordersArray))

  const productsOnOrder = await prisma.productsOnOrder.findMany()

  if (session?.user === undefined) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }

  return {
    props: { orders, productsOnOrder },
  }
}

const User = ({ orders, productsOnOrder }: OrdersDetails) => {
  const { data: session } = useSession()

  function groupBy<T>(arr: T[], fn: (item: T) => any) {
    return arr.reduce<Record<string, T[]>>((prev, curr) => {
      const groupKey = fn(curr)
      const group = prev[groupKey] || []
      group.push(curr)
      return { ...prev, [groupKey]: group }
    }, {})
  }

  const groupProductsByOrders = Object.values(
    groupBy(productsOnOrder, (item) => item.orderId)
  )

  console.log(groupProductsByOrders)

  return (
    <>
      <Head>
        <title>Booze - Usuário</title>
        <link rel='icon' href='/minibar-black.png' />
      </Head>
      <main className='flex flex-col items-start justify-center gap-8 py-8 px-4'>
        {session ? (
          <div className='space-y-10 w-full'>
            <div className='flex flex-col items-center justify-center gap-3'>
              <div>
                <img
                  src={session.user?.image}
                  alt=''
                  className='rounded-full w-28 h-28 flex items-center justify-center'
                />
              </div>
              <div className='flex flex-col items-center justify-center'>
                <span className='font-bold text-xl'>{session.user?.name}</span>
                <span className='text-sm'>{session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className='mt-3 py-2 px-4 rounded-lg font-bold bg-purple-700 text-white hover:bg-purple-600 
                              transition-all disabled:opacity-25 w-full'
                >
                  Sair
                </button>
              </div>
            </div>

            <hr className='border-gray-300' />

            <div className='space-y-4'>
              <h2 className='text-lg font-semibold'>Todos os pedidos</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {orders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className='bg-white border border-gray-300 rounded-md w-full h-full p-4 space-y-3'
                    >
                      <div className='flex items-start justify-between gap-2 '>
                        <p className='font-semibold text-lg uppercase'>
                          {order.payment_mode}
                        </p>
                        <p className='font-semibold text-lg'>
                          {priceFormatter.format(order.price_amount / 100)}
                        </p>
                      </div>
                      <div></div>
                      <div className='flex items-center justify-center'>
                        <button className='py-2 w-full bg-green-500 rounded-md hover:bg-green-700 transition-all'>
                          Refazer o pedido
                        </button>
                        <button className='py-2 w-full text-green-500 hover:text-green-700 transition-all'>
                          Ver Mais
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p>Você ainda não esta logado</p>

            <button
              onClick={() => signIn('google')}
              className='py-3 px-4 rounded-lg font-bold bg-purple-700 text-white hover:bg-purple-600 
                transition-all disabled:opacity-25 w-full'
            >
              Logar com Google
            </button>
          </>
        )}
      </main>
    </>
  )
}

User.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default User
