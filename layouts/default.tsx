const Layout = ({ children }: any) => {
  return (
    <>
      <div className="flex flex-col max-w-lg mx-auto w-full items-center">
        {children}
      </div>
    </>
  )
}

export default Layout
