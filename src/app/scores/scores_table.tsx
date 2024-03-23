import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import Link from "next/link";
import { ScoreListDto } from "../../db/score_list/score_list_dto";
import {
  OrderDirection,
  ScoreOrder,
  ScoreOrderItem,
  ScoreOrderTarget,
  primaryScoreOrder,
  scoreOrderSetItem,
} from "../../domain/score_query/score_order";
import { Difficulty, difficultyToStr } from "../../domain/track/difficulty";
import { skillTypeToStr } from "../../domain/track/skill_type";
import { lvToString } from "../../domain/track/track";
import {
  achievementToPercent,
  skillPointToDisplay,
} from "../../domain/track/user_track";
import neverError from "../../utils/never_error";

export default function ScoresTable({
  scoresDto,
  order,
  pageIndex,
  rowsPerPage,
  onOrderChange,
  onPageChange,
}: {
  scoresDto: ScoreListDto | undefined;
  order: ScoreOrder;
  pageIndex: number;
  rowsPerPage: number;
  onOrderChange: (order: ScoreOrder) => unknown;
  onPageChange: (pageIndex: number) => unknown;
}) {
  if (scoresDto === undefined) {
    return null;
  }

  const { rows: scores, count: scoreCount } = scoresDto;

  const primaryOrder = primaryScoreOrder(order);

  const handleOrderItemChange = (orderItem: ScoreOrderItem) => {
    const newOrder = scoreOrderSetItem(order, orderItem);
    onOrderChange(newOrder);
  };

  const handlePageChange = (_e: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <ScoreTableHeaderCell
                target="title"
                label="曲名"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="skillType"
                label="区分"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="long"
                label="LONG"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="difficulty"
                label="難易度"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="lv"
                label="Lv"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="like"
                label="好み"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="achievement"
                label="達成率"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
              <ScoreTableHeaderCell
                target="skillPoint"
                label="Skill Point"
                primaryOrder={primaryOrder}
                onChange={handleOrderItemChange}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {scores.map((score) => (
              <TableRow key={rowKey(score)}>
                <TableCell>
                  <Link href={`/tracks/${score.trackId}`}>{score.title}</Link>
                </TableCell>
                <TableCell>{skillTypeToStr(score.skillType)}</TableCell>
                <TableCell>{score.long ? "LONG" : undefined}</TableCell>
                <TableCell>{difficultyToStr(score.difficulty)}</TableCell>
                <TableCell>{lvToString(score.lv)}</TableCell>
                <TableCell>{likeView(score.like)}</TableCell>
                <TableCell>{achievementView(score.achievement)}</TableCell>
                <TableCell>{skillPointView(score.skillPoint)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={scoreCount}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
        page={pageIndex}
        onPageChange={handlePageChange}
      />
    </Paper>
  );
}

function ScoreTableHeaderCell({
  target,
  label,
  primaryOrder,
  onChange,
}: {
  target: ScoreOrderTarget;
  label: string;
  primaryOrder: ScoreOrderItem | undefined;
  onChange: (orderItem: ScoreOrderItem) => unknown;
}) {
  const myOrder = primaryOrder?.target === target ? primaryOrder : undefined;

  const handleClick = () => {
    onChange({
      target,
      direction: newOrderDirection(myOrder?.direction),
    });
  };

  return (
    <TableCell sortDirection={myOrder?.direction}>
      <TableSortLabel
        active={myOrder !== undefined}
        direction={myOrder?.direction}
        onClick={handleClick}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function newOrderDirection(
  oldDirection: OrderDirection | undefined,
): OrderDirection {
  switch (oldDirection) {
    case "asc":
      return "desc";

    case "desc":
    case undefined:
      return "asc";

    default:
      throw neverError(oldDirection);
  }
}

function rowKey({
  trackId,
  difficulty,
}: {
  trackId: string;
  difficulty: Difficulty;
}): string {
  return `${trackId}_${difficulty}`;
}

function likeView(like: number | undefined): string {
  if (like === undefined) return "";
  else return `★${like}`;
}

function achievementView(achievement: number | undefined): string {
  return `${achievementToPercent(achievement ?? 0)}%`;
}

function skillPointView(skillPoint: number | undefined): string {
  return skillPointToDisplay(skillPoint ?? 0);
}
