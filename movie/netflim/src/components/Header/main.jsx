
const Heading = ({children}) => {
	return (
		<div  className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-3xl font-bold text-red-600 md:text-4xl lg:text-5xl">{children}</h1>
		</div>
	);
};

export default Heading;
