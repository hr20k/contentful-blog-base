import {createHash} from 'crypto';

import {documentToReactComponents, Options} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {ArrowDropDown} from '@mui/icons-material';
import {List, ListItem, Typography} from '@mui/material';
import {FC, useMemo} from 'react';
import {Link} from 'react-scroll';

const headingTypes = [BLOCKS.HEADING_2];

const Nav = styled.nav({
  padding: '16px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
});

const ScrollLink = styled(Link)({
  width: '100%',
  padding: '8px 16px',
});

interface TableOfContentsProps {
  contents: Document | null;
}

type Props = TableOfContentsProps;

const TableOfContents: FC<Props> = ({contents}) => {
  const document = useMemo(
    () =>
      contents !== null
        ? {
            ...contents,
            content: contents.content.filter((item) => headingTypes.includes(item.nodeType)),
          }
        : null,
    [contents]
  );

  const options: Options = {
    renderNode: {
      [BLOCKS.HEADING_2]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <ListItem button divider sx={{padding: 0}}>
              <ScrollLink to={anchor} activeClass="active" smooth={true} duration={500}>
                {children}
              </ScrollLink>
            </ListItem>
          );
        }
        return null;
      },
    },
  };

  return document !== null && document.content.length > 0 ? (
    <Nav>
      <Typography sx={{fontWeight: 'bold', display: 'flex'}}>
        <ArrowDropDown />
        目次
      </Typography>
      <List>{documentToReactComponents(document, options)}</List>
    </Nav>
  ) : null;
};

export {TableOfContents};
