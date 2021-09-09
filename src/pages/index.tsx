import React, { FC } from "react"

import Seo from "../components/Seo"
import Layout from '../components/Layout'

const Index: FC = () => {
  return (
    <Layout>
      <Seo title="Blog"/>
      <div className="prose m-auto mb-8">
        <h1 className="mb-0">Kim</h1>
      </div>
    </Layout>
  )
}

export default Index