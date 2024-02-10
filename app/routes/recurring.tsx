import { prisma } from "~/utils/prisma.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export async function loader() {

	const recurring = await prisma.recurringCharges.findMany()

	return json({ recurring }, { status: 200 })
}

export default function Recurring() {
	const {recurring} = useLoaderData<typeof loader>()

	const totalCost = recurring.reduce((acc, {amount}) => acc + amount, 0)
	return (
		<div>
			<h1>Recurring Charges</h1>
			<TableContainer component={Paper} sx={{
				maxWidth: 650,
			}}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align="right">Name</TableCell>
							<TableCell align="right">Amount</TableCell>
							<TableCell align="right">Frequency</TableCell>
							<TableCell align="right">Due Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{recurring.map((charge) => (
							<TableRow
								key={charge.name}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{charge.name}
								</TableCell>
								<TableCell align="right">{charge.amount}</TableCell>
								<TableCell align="right">{charge.frequency}</TableCell>
								<TableCell align="right">{charge.dueDate.split('T')[0]}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<h2>Total Cost: {totalCost}</h2>
			<h2>Add Recurring Charge</h2>
			<Form method="post" reloadDocument>
				<label htmlFor="name">Name</label>
				<input	type="text" name="name"/>
				<label htmlFor="amount">Amount</label>
				<input	type="number" name="amount"/>
				<label htmlFor="frequency">Frequency</label>
				<input	type="text" name="frequency"/>
				<label htmlFor="dueDate">Due Date</label>
				<input	type="date" name="dueDate"/>
				<input type="submit" value="Add Recurring Charge"/>
			</Form>
		</div>
	);
}

export async function action({request}: ActionFunctionArgs) {
	const formData = await request.formData()

	const name = formData.get('name')
	const amount = formData.get('amount')
	const frequency = formData.get('frequency')
	const dueDate = formData.get('dueDate')

	await prisma.recurringCharges.create({
		data: {
			name: name as string,
			amount: parseInt(amount as string),
			frequency: frequency as string,
			dueDate: new Date(dueDate as string)
		}
	})

	return null
}