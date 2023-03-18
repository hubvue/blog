import React, { ChangeEvent, FC, useEffect, useState } from "react"
import Editor from "@monaco-editor/react"
import { Input, Select, Button, message } from "antd"

import Layout from "../../components/Layout/index"
import { useSwitchTheme } from "../../hooks/useSwitchTheme"
import { isJson } from "../../utils/json"

interface Props {
  location: Location
  pageContext: Record<string, any>
}


const ToolsTemplate: FC<Props> = ({ pageContext }) => {
  const [theme, switchTheme] = useSwitchTheme()

  useEffect(() => {
    if (theme !== "dark") {
      switchTheme('dark')
    }
  }, [theme])

  const [typeValue, setTypeValue] = useState<string>("")
  const [jsonValue, setJsonValue] = useState<string>("")

  const jsonChangeHandler = (value: string | undefined) => {
    if (value) {
      setJsonValue(value)
    }
  }

  const [typeName, setTypeName] = useState<string>("AutoGenerate")
  const typeNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist()
    setTypeName(event.target.value)
  }
  const [lang, setLang] = useState<string>("typescript")
  const langChangeHandler = (value: string) => {
    setLang(value)
  }

  const genClickHandler = () => {
    if (!isJson(jsonValue)) {
      message.error("json must be object or array!")
      return 
    }
    const formData = new FormData()
    formData.append('input',JSON.stringify(JSON.parse(jsonValue.trim())))
    formData.append('name', typeName)
    formData.append('lang', lang)

    const headers = new Headers()
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', "application/x-www-form-urlencoded")
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', 'true');
    const hideLoading = message.loading("Loading...")
    fetch('https://api.cckim.cn/common/json/json2type', {
      method: 'POST',
      body: formData,
      headers
    })
    .then(res => res.json())
    .then(data => {
      hideLoading()
      if (data.err) {
        message.error(data.err)
      }
      setTypeValue(data.data)
    })
    .catch(err => {
      hideLoading()
      message.error(`parser error: ${err.message}`)
    })
    
  }

  return (
    <Layout fullScreen={true} hideTabBar={true}>
    <div className="pt-10">
      <div className="text-center text-3xl">JSON to Type</div>
      <div className="flex items-center justify-center mt-8">
        <div className="flex items-center">
          <div className="text-lg">Type Name: </div>
          <Input
            className="w-52 ml-2"
            placeholder="type name"
            value={typeName}
            onChange={typeNameChangeHandler}
          />
        </div>
        <div className="flex items-center ml-4">
        <div className="text-lg">Language: </div>
          <Select
            className="w-52 ml-2"
            defaultValue="typescript"
            value={lang}
            onChange={langChangeHandler}
          >
            <Select.Option value="typescript">Typescript</Select.Option>
            <Select.Option value="go">Go</Select.Option>
          </Select>
        </div>
        <Button className="ml-8" type="primary" onClick={genClickHandler} danger>Run</Button>
      </div>
      <div className="flex justify-center mt-6">
        <Editor
          height="80vh"
          width="50%"
          defaultLanguage="json"
          value={jsonValue}
          onChange={jsonChangeHandler}
          theme="vs-dark"
        />
        <Editor
          height="80vh"
          width="50%"
          language={lang}
          defaultValue=""
          value={typeValue}
          theme="vs-dark"
        />
      </div>
    </div>
    </Layout>
  )
}

export default ToolsTemplate
