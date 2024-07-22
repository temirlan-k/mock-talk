import dynamic from 'next/dynamic'


const HeyGen = dynamic(
    () => import('../HeyGenComponent/HeygenComponent'),
    { ssr: false }
)

const HeyGenPage = () => {
    return <HeyGen />;
};

export default HeyGenPage;
