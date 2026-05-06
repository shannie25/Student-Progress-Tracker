type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  return (
    <header className="app-header">
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
