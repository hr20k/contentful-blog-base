import {createHash} from 'crypto';

import {documentToReactComponents, Options} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {ArrowDropDown, ArrowDropUp} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import {FC, useCallback, useMemo, useState} from 'react';
import {Link} from 'react-scroll';

const headingTypes = [
  BLOCKS.HEADING_2,
  BLOCKS.HEADING_3,
  BLOCKS.HEADING_4,
  BLOCKS.HEADING_5,
  BLOCKS.HEADING_6,
];

const ScrollLink = styled(Link)({
  width: '100%',
  padding: '8px 16px',
});

interface TableOfContentsProps {
  contents: Document | null;
}

type Props = TableOfContentsProps;

const TableOfContents: FC<Props> = ({contents}) => {
  const [tocExpanded, setTocExpanded] = useState(true);

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
                <ListItemText>{children}</ListItemText>
              </ScrollLink>
            </ListItem>
          );
        }
        return null;
      },
      [BLOCKS.HEADING_3]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <ListItem button divider sx={{padding: '0 0 0 16px'}}>
              <ScrollLink to={anchor} activeClass="active" smooth={true} duration={500}>
                <ListItemText>{children}</ListItemText>
              </ScrollLink>
            </ListItem>
          );
        }
        return null;
      },
      [BLOCKS.HEADING_4]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <ListItem button divider sx={{padding: '0 0 0 16px'}}>
              <ScrollLink to={anchor} activeClass="active" smooth={true} duration={500}>
                <ListItemText primaryTypographyProps={{sx: {fontSize: '0.8rem'}}}>
                  {children}
                </ListItemText>
              </ScrollLink>
            </ListItem>
          );
        }
        return null;
      },
      [BLOCKS.HEADING_5]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <ListItem button divider sx={{padding: '0 0 0 16px'}}>
              <ScrollLink to={anchor} activeClass="active" smooth={true} duration={500}>
                <ListItemText primaryTypographyProps={{sx: {fontSize: '0.8rem'}}}>
                  {children}
                </ListItemText>
              </ScrollLink>
            </ListItem>
          );
        }
        return null;
      },
      [BLOCKS.HEADING_6]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <ListItem button divider sx={{padding: '0 0 0 16px'}}>
              <ScrollLink to={anchor} activeClass="active" smooth={true} duration={500}>
                <ListItemText primaryTypographyProps={{sx: {fontSize: '0.8rem'}}}>
                  {children}
                </ListItemText>
              </ScrollLink>
            </ListItem>
          );
        }
        return null;
      },
    },
  };

  const handleClickToc = useCallback(() => setTocExpanded((prev) => !prev), []);

  return document !== null && document.content.length > 0 ? (
    <nav>
      <Accordion
        expanded={tocExpanded}
        disableGutters
        onChange={handleClickToc}
        sx={{backgroundColor: '#f0f0f0'}}
      >
        <AccordionSummary>
          <Typography sx={{fontWeight: 'bold', display: 'flex'}}>
            {tocExpanded ? <ArrowDropDown /> : <ArrowDropUp />}目次
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>{documentToReactComponents(document, options)}</List>
        </AccordionDetails>
      </Accordion>
    </nav>
  ) : null;
};

export {TableOfContents};
