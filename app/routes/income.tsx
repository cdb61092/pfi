import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import { Form, useLoaderData } from "@remix-run/react";


export async function loader() {
	const income = await prisma.income.findMany()

	return json({ income }, { status: 200 })
}

export default function Income() {
	const { income } = useLoaderData<typeof loader>()

	return (
		<div>
			<h1>Income</h1>
			{income.map((income, index) => {
				return (
					<div key={index}>
						Income
						<p>{income.name}</p>
						<p>{income.amount}</p>
						<p>{income.frequency}</p>
						<p>{income.nextPayDate}</p>
					</div>
				);
			})}
			<h2>Add Income</h2>
			<Form method="post" reloadDocument>
				<label htmlFor="name">Name</label>
				<input	type="text" name="name"/>
				<label htmlFor="amount">Amount</label>
				<input	type="number" name="amount"/>
				<label htmlFor="frequency">Frequency</label>
				<input	type="text" name="frequency"/>
				<label htmlFor="nextPayDate">Next Pay Date</label>
				<input name="nextPayDate" type="date"/>
				<input type="submit" value="Add Income"/>
			</Form>
		</div>
	);
}

export async function action({request}: ActionFunctionArgs) {
	const formData = await request.formData()

	const name = formData.get('name')
	const amount = formData.get('amount')
	const frequency = formData.get('frequency')
	const date = formData.get('nextPayDate')

	await prisma.income.create({
		data: {
			name: name as string,
			amount: parseFloat(amount as string),
			frequency: frequency as string,
			nextPayDate: new Date(date as string)
		}
	})

	return json({status: 200})
}