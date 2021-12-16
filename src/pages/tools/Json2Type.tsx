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
  const [theme] = useSwitchTheme()
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">(
    theme === "dark" ? "vs-dark" : "light"
  )

  useEffect(() => {
    if (theme === "dark") {
      setEditorTheme("vs-dark")
    } else {
      setEditorTheme("light")
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
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', 'true');
  
    fetch('https://api.cckim.cn/json/json2type', {
      method: 'POST',
      body: formData,
      headers
    })
    .then(res => res.json())
    .then(data => {
      if (data.err) {
        message.error(data.err)
      }
      setTypeValue(data.data)
    })
    .catch(err => {
      message.error("parser error!")
    })
    
  }

  return (
    <Layout fullScreen={true}>
      <div className="text-center text-3xl">JSON to Type</div>
      <div className="flex items-center justify-center mt-8">
        <Input
          className="w-52"
          placeholder="type name"
          value={typeName}
          onChange={typeNameChangeHandler}
        />
        <Select
          className="w-52 ml-4"
          defaultValue="typescript"
          value={lang}
          onChange={langChangeHandler}
        >
          <Select.Option value="typescript">Typescript</Select.Option>
          {/* <Select.Option value="go">Go</Select.Option> */}
        </Select>
        <Button className="ml-4" type="dashed" onClick={genClickHandler}>Run</Button>
      </div>
      <div className="flex justify-center mt-6">
        <Editor
          height="80vh"
          width="50%"
          defaultLanguage="json"
          value={jsonValue}
          onChange={jsonChangeHandler}
          theme={editorTheme}
        />
        <Editor
          height="80vh"
          width="50%"
          defaultLanguage="typescript"
          defaultValue=""
          value={typeValue}
          theme={editorTheme}
        />
      </div>
    </Layout>
  )
}

export default ToolsTemplate
