import React from 'react';

const Section: React.FC<{ children: React.ReactNode }> = (props) => {
    return <section>{props.children}</section>
}

export default Section;
